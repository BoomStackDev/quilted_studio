import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend } from '@/lib/resend'
import { brand } from '@/lib/brand.config'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  feedback: z.string().min(1, 'Feedback is required'),
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

    const { error: updateError } = await adminSupabase
      .from('creators')
      .update({
        status: 'approved_gate1',
        feedback_for_creator: parsed.data.feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error requesting changes:', updateError)
      return NextResponse.json({ error: 'Failed to request changes' }, { status: 500 })
    }

    const { data: creatorProfile } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single()

    const email = creatorProfile?.email

    if (email) {
      try {
        const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/dashboard/creator`
        await getResend().emails.send({
          from: `${brand.name} <noreply@quilted.studio>`,
          to: email,
          subject: `Your ${brand.name} profile needs some updates`,
          text: `Hi ${creator.display_name ?? 'there'},\n\nThanks for submitting your ${brand.name} profile for review. Before it goes live, there are a few changes we'd like you to make:\n\n${parsed.data.feedback}\n\nLog back in to your dashboard at ${dashboardUrl} to make the updates, then submit again for review.\n\nThanks,\nDave`,
        })
      } catch (emailErr) {
        console.error('Failed to send request-changes email:', emailErr)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in request-changes route:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
