import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend } from '@/lib/resend'
import { brand } from '@/lib/brand.config'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const rejectSchema = z.object({
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
    const parsed = rejectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Get application for email
    const { data: application } = await adminSupabase
      .from('creator_applications')
      .select('name, email, status')
      .eq('id', id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Application already reviewed' }, { status: 400 })
    }

    await adminSupabase
      .from('creator_applications')
      .update({
        status: 'rejected',
        admin_notes: parsed.data.admin_notes ?? null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', id)

    try {
      await getResend().emails.send({
        from: `${brand.name} <noreply@quilted.studio>`,
        to: application.email,
        subject: `Your ${brand.name} application`,
        text: `Hi ${application.name},\n\nThank you for applying to list on ${brand.name}.\n\nAfter reviewing your application, we are not able to offer you a spot at this time. We carefully review every application and sometimes the timing or fit just isn't right.\n\nWe wish you well with your teaching.\n\nDave`,
      })
    } catch (emailErr) {
      console.error('Failed to send rejection email:', emailErr)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in reject route:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
