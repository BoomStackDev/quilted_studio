import { createAdminClient } from '@/lib/supabase/admin'
import { getResend } from '@/lib/resend'
import { brand } from '@/lib/brand.config'
import { NextResponse, type NextRequest } from 'next/server'

async function isDestinationHealthy(url: string): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })
    return res.status < 400
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const adminSupabase = createAdminClient()
    const { data: links, error } = await adminSupabase
      .from('affiliated_links')
      .select(
        'id, slug, destination_url, is_healthy, course_id, courses(title, creator_id, creators(id, profiles(email)))'
      )

    if (error) {
      console.error('Error loading links for health check:', error)
      return NextResponse.json({ error: 'Failed to load links' }, { status: 500 })
    }

    let checked = 0
    let healthy = 0
    let unhealthy = 0
    let emails_sent = 0

    const now = new Date().toISOString()

    for (const link of links ?? []) {
      checked++
      const ok = await isDestinationHealthy(link.destination_url)
      if (ok) healthy++
      else unhealthy++

      const { error: updateError } = await adminSupabase
        .from('affiliated_links')
        .update({ is_healthy: ok, last_checked_at: now })
        .eq('id', link.id)

      if (updateError) {
        console.error(`Error updating health for link ${link.id}:`, updateError)
      }

      // Only notify on transition: previously null or true, now false
      const previouslyHealthy = link.is_healthy !== false
      if (!ok && previouslyHealthy) {
        const course = Array.isArray(link.courses) ? link.courses[0] : link.courses
        const creator = course
          ? Array.isArray(course.creators)
            ? course.creators[0]
            : course.creators
          : null
        const profile = creator
          ? Array.isArray(creator.profiles)
            ? creator.profiles[0]
            : creator.profiles
          : null
        const email = profile?.email
        const title = course?.title ?? 'your course'

        if (email) {
          try {
            const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/dashboard/creator/courses`
            await getResend().emails.send({
              from: `${brand.name} <noreply@quilted.studio>`,
              to: email,
              subject: `Action needed — a course link on ${brand.name} is not working`,
              text: `Hi,\n\nWe checked the link for your course "${title}" on ${brand.name} and it's not responding.\n\nDestination URL: ${link.destination_url}\n\nPlease update the link in your creator dashboard at ${dashboardUrl} so students can reach your course.\n\n— ${brand.name}`,
            })
            emails_sent++
          } catch (emailErr) {
            console.error(`Failed to send broken-link email for link ${link.id}:`, emailErr)
          }
        }
      }
    }

    return NextResponse.json({ checked, healthy, unhealthy, emails_sent }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in cron /api/cron/check-links:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
