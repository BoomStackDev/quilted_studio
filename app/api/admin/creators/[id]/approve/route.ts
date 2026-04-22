import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend } from '@/lib/resend'
import { brand } from '@/lib/brand.config'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(
  _request: NextRequest,
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

    const { data: creator } = await adminSupabase
      .from('creators')
      .select('id, display_name, slug, status')
      .eq('id', id)
      .single()

    if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

    if (creator.status !== 'pending_gate2') {
      return NextResponse.json({ error: 'Creator is not pending Gate 2 review' }, { status: 400 })
    }

    const { error: updateError } = await adminSupabase
      .from('creators')
      .update({
        status: 'approved',
        published: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error approving creator:', updateError)
      return NextResponse.json({ error: 'Failed to approve creator' }, { status: 500 })
    }

    const { data: creatorProfile } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single()

    const email = creatorProfile?.email

    if (email) {
      try {
        const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/creators/${creator.slug}`
        await getResend().emails.send({
          from: `${brand.name} <noreply@quilted.studio>`,
          to: email,
          subject: `You're live on ${brand.name} — your profile is published`,
          text: `Hi ${creator.display_name ?? 'there'},\n\nGreat news — your ${brand.name} profile is approved and now live.\n\nStudents can find you here: ${profileUrl}\n\nFrom now on, every student who clicks through to your courses from the ${brand.name} directory will be tracked so your affiliate commissions come through correctly.\n\nThanks for being part of ${brand.name},\nDave`,
        })
      } catch (emailErr) {
        console.error('Failed to send Gate 2 approval email:', emailErr)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in approve creator route:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
