import { createClient } from '@/lib/supabase/server'
import { getResend } from '@/lib/resend'
import { z } from 'zod'

const applicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  youtube_url: z.string().url('Valid YouTube URL is required'),
  primary_platform: z.string().min(1, 'Please select your current platform'),
  referral_source: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = applicationSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, youtube_url, primary_platform, referral_source } = parsed.data

    const supabase = await createClient()

    const { error: dbError } = await supabase
      .from('creator_applications')
      .insert({
        name,
        email,
        youtube_url,
        primary_platform,
        referral_source: referral_source ?? null,
        status: 'pending',
      })

    if (dbError) {
      console.error('DB error inserting application:', dbError)
      return Response.json(
        { error: 'Failed to save application. Please try again.' },
        { status: 500 }
      )
    }

    // Notify Dave — email failure must not block the success response
    try {
      await getResend().emails.send({
        from: 'Quilted Studio <noreply@quilted.studio>',
        to: 'dave@quilted.studio',
        subject: `New creator application — ${name}`,
        text: `A new creator application has been submitted.\n\nName: ${name}\nEmail: ${email}\nYouTube: ${youtube_url}\nPlatform: ${primary_platform}\nReferral: ${referral_source ?? 'Not provided'}\n\nReview it in the admin panel.`,
      })
    } catch (emailErr) {
      console.error('Resend notification failed:', emailErr)
    }

    return Response.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in /api/apply:', err)
    return Response.json(
      { error: 'Unexpected error. Please try again.' },
      { status: 500 }
    )
  }
}
