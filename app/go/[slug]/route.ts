import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'crypto'
import type { NextRequest } from 'next/server'

const BOT_PATTERNS = ['bot', 'crawler', 'spider', 'slurp', 'facebookexternalhit']

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true
  const ua = userAgent.toLowerCase()
  return BOT_PATTERNS.some(p => ua.includes(p))
}

function extractClientIp(request: NextRequest): string | null {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const xReal = request.headers.get('x-real-ip')
  if (xReal) return xReal.trim()
  return null
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: link } = await supabase
    .from('affiliated_links')
    .select('id, slug, destination_url, course_id, courses(creator_id)')
    .eq('slug', slug)
    .maybeSingle()

  if (!link) {
    return new Response('Not found', { status: 404 })
  }

  const courseRel = Array.isArray(link.courses) ? link.courses[0] : link.courses
  const creatorId = courseRel?.creator_id
  const destination = link.destination_url

  // Session-aware — may be null for anonymous clicks
  const { data: { user } } = await supabase.auth.getUser()
  const studentId = user?.id ?? null

  const userAgent = request.headers.get('user-agent')

  if (!isBot(userAgent) && creatorId) {
    const rawIp = extractClientIp(request)
    const ipHash = rawIp ? hashIp(rawIp) : null

    try {
      const adminSupabase = createAdminClient()
      const { error } = await adminSupabase.from('affiliated_clicks').insert({
        link_id: link.id,
        student_id: studentId,
        creator_id: creatorId,
        course_id: link.course_id,
        clicked_at: new Date().toISOString(),
        ip_hash: ipHash,
        user_agent: userAgent,
      })

      if (error) {
        console.error('Error logging click:', error)
      }
    } catch (err) {
      console.error('Unexpected error logging click:', err)
    }
  }

  return new Response(null, {
    status: 302,
    headers: { Location: destination },
  })
}
