import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export default async function AdminLinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const adminSupabase = createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/auth/signin')

  const { data: linksData } = await adminSupabase
    .from('affiliated_links')
    .select(
      'id, slug, destination_url, is_healthy, last_checked_at, courses(title, creators(display_name))'
    )
    .order('is_healthy', { ascending: true })
    .order('last_checked_at', { ascending: false })

  const links = (linksData ?? []).map(row => {
    const course = Array.isArray(row.courses) ? row.courses[0] : row.courses
    const creator = course
      ? Array.isArray(course.creators)
        ? course.creators[0]
        : course.creators
      : null
    return {
      id: row.id,
      slug: row.slug,
      destination_url: row.destination_url,
      is_healthy: row.is_healthy,
      last_checked_at: row.last_checked_at,
      course_title: course?.title ?? '—',
      creator_name: creator?.display_name ?? '—',
    }
  })

  const healthyCount = links.filter(l => l.is_healthy === true).length
  const unhealthyCount = links.filter(l => l.is_healthy === false).length
  const neverCheckedCount = links.filter(l => l.is_healthy === null).length

  return (
    <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <a href="/admin" style={{ fontSize: '0.9rem', color: '#6F7F75' }}>← Back to admin</a>
      <h1 style={{ marginTop: '1rem' }}>Admin — Link Health</h1>

      <p style={{ margin: '0.5rem 0 1.5rem', color: '#5A5A5A' }}>
        {healthyCount} healthy · {unhealthyCount} unhealthy · {neverCheckedCount} never checked
      </p>

      {links.length === 0 ? (
        <p style={{ color: '#5A5A5A' }}>No affiliated links yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #D6CFC6' }}>
              <th style={{ padding: '0.5rem' }}>Status</th>
              <th style={{ padding: '0.5rem' }}>Course</th>
              <th style={{ padding: '0.5rem' }}>Creator</th>
              <th style={{ padding: '0.5rem' }}>Slug</th>
              <th style={{ padding: '0.5rem' }}>Destination</th>
              <th style={{ padding: '0.5rem' }}>Last checked</th>
            </tr>
          </thead>
          <tbody>
            {links.map(link => {
              const unhealthy = link.is_healthy === false
              const never = link.is_healthy === null
              const statusLabel = unhealthy ? 'Unhealthy' : never ? 'Never checked' : 'Healthy'
              const statusColor = unhealthy ? '#c0392b' : never ? '#5A5A5A' : '#2e7d32'
              return (
                <tr
                  key={link.id}
                  style={{
                    borderBottom: '1px solid #EAE4DB',
                    background: unhealthy ? '#fdecea' : 'transparent',
                  }}
                >
                  <td style={{ padding: '0.5rem', fontWeight: 600, color: statusColor }}>{statusLabel}</td>
                  <td style={{ padding: '0.5rem' }}>{link.course_title}</td>
                  <td style={{ padding: '0.5rem' }}>{link.creator_name}</td>
                  <td style={{ padding: '0.5rem' }}><code>{link.slug}</code></td>
                  <td style={{ padding: '0.5rem', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <a href={link.destination_url} target="_blank" rel="noreferrer" style={{ color: '#6F7F75' }}>
                      {link.destination_url}
                    </a>
                  </td>
                  <td style={{ padding: '0.5rem', color: '#5A5A5A' }}>
                    {link.last_checked_at ? new Date(link.last_checked_at).toLocaleString() : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </main>
  )
}
