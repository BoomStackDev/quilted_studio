import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend } from '@/lib/resend'
import { brand } from '@/lib/brand.config'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // Verify the requesting user is an admin
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

    // Get the application
    const { data: application, error: appError } = await adminSupabase
      .from('creator_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Application already reviewed' }, { status: 400 })
    }

    // Create Supabase auth user
    const { data: newUser, error: userError } = await adminSupabase.auth.admin.createUser({
      email: application.email,
      email_confirm: true,
    })

    if (userError || !newUser.user) {
      console.error('Error creating auth user:', userError)
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
    }

    const creatorId = newUser.user.id

    // Create profiles row
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: creatorId,
        email: application.email,
        role: 'creator',
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    // Create creators row
    const { error: creatorError } = await adminSupabase
      .from('creators')
      .insert({
        id: creatorId,
        display_name: application.name,
        creator_type: 'affiliated',
        status: 'approved_gate1',
        published: false,
      })

    if (creatorError) {
      console.error('Error creating creator:', creatorError)
      return NextResponse.json({ error: 'Failed to create creator record' }, { status: 500 })
    }

    // Update application status
    await adminSupabase
      .from('creator_applications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', id)

    // Send welcome email with magic link
    const { data: linkData } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: application.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/creator`,
      },
    })

    try {
      await getResend().emails.send({
        from: `${brand.name} <noreply@quilted.studio>`,
        to: application.email,
        subject: `You're approved — welcome to ${brand.name}`,
        text: `Hi ${application.name},\n\nGreat news — your application to list on ${brand.name} has been approved.\n\nClick the link below to access your creator dashboard and get started:\n\n${linkData?.properties?.action_link ?? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin`}\n\nThis link expires in 24 hours. If it expires, just visit ${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin to request a new one.\n\nWelcome aboard,\nDave`,
      })
    } catch (emailErr) {
      console.error('Failed to send approval email:', emailErr)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in approve route:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
