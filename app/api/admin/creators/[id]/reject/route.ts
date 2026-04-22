import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend } from '@/lib/resend'
import { brand } from '@/lib/brand.config'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  admin_notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { data: creator } = await adminSupabase
      .from('creators')
      .select('id, display_name, status')
      .eq('id', id)
      .single()

    if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

    if (creator.status !== 'pending_gate2') {
      return NextResponse.json({ error: 'Creator is not pending Gate 2 review' }, { status: 400 })
    }

    const updatePayload: { status: string; updated_at: string; admin_notes?: string } = {
      status: 'rejected',
      updated_at: new Date().toISOString(),
    }
    if (parsed.data.admin_notes) updatePayload.admin_notes = parsed.data.admin_notes

    const { error: updateError } = await adminSupabase
      .from('creators')
      .update(updatePayload)
      .eq('id', id)

    if (updateError) {
      console.error('Error rejecting creator:', updateError)
      return NextResponse.json({ error: 'Failed to reject creator' }, { status: 500 })
    }

    const { data: creatorProfile } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single()

    const email = creatorProfile?.email

    if (email) {
      try {
        await getResend().emails.send({
          from: `${brand.name} <noreply@quilted.studio>`,
          to: email,
          subject: `Your ${brand.name} application`,
          text: `Hi ${creator.display_name ?? 'there'},\n\nThank you for the time you put into building your ${brand.name} profile. After reviewing it, we've decided it isn't the right fit for ${brand.name} at this point.\n\nThis isn't a reflection on your teaching — the directory has a narrow scope and we want each listing to fit it closely. We genuinely appreciate the effort, and we wish you continued success with your students.\n\nAll the best,\nDave`,
        })
      } catch (emailErr) {
        console.error('Failed to send Gate 2 rejection email:', emailErr)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in reject creator route:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
