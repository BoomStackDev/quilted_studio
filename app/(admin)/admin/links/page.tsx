import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/layout/AdminShell'

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
    <AdminShell title="Link Health">
      <p className="text-muted-text mb-4">
        {healthyCount} healthy · {unhealthyCount} unhealthy · {neverCheckedCount} never checked
      </p>

      {links.length === 0 ? (
        <p className="text-muted-text">No affiliated links yet.</p>
      ) : (
        <div className="bg-white border border-soft-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper-warm-gray">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium text-muted-text">Status</th>
                <th className="px-3 py-2 font-medium text-muted-text">Course</th>
                <th className="px-3 py-2 font-medium text-muted-text">Creator</th>
                <th className="px-3 py-2 font-medium text-muted-text">Slug</th>
                <th className="px-3 py-2 font-medium text-muted-text">Destination</th>
                <th className="px-3 py-2 font-medium text-muted-text">Last checked</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => {
                const unhealthy = link.is_healthy === false
                const never = link.is_healthy === null
                const statusLabel = unhealthy ? 'Unhealthy' : never ? 'Never checked' : 'Healthy'
                const rowClass = unhealthy
                  ? 'bg-red-50 text-red-700 border-t border-soft-border'
                  : never
                    ? 'text-muted-text border-t border-soft-border'
                    : 'text-ink border-t border-soft-border'
                return (
                  <tr key={link.id} className={rowClass}>
                    <td className="px-3 py-2 font-medium">{statusLabel}</td>
                    <td className="px-3 py-2">{link.course_title}</td>
                    <td className="px-3 py-2">{link.creator_name}</td>
                    <td className="px-3 py-2"><code className="text-xs">{link.slug}</code></td>
                    <td className="px-3 py-2 max-w-[280px] truncate">
                      <a href={link.destination_url} target="_blank" rel="noreferrer" className="text-studio-sage hover:underline">
                        {link.destination_url}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {link.last_checked_at ? new Date(link.last_checked_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  )
}
