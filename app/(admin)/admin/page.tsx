import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import ApplicationQueue from './ApplicationQueue'

export default async function AdminPage() {
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

  const [{ data: applications }, { count: pendingGate2Count }] = await Promise.all([
    adminSupabase
      .from('creator_applications')
      .select('*')
      .order('submitted_at', { ascending: false }),
    adminSupabase
      .from('creators')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_gate2'),
  ])

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Admin — Application Queue</h1>
      <p style={{ margin: '0 0 1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <a href="/admin/creators" style={{ color: '#6F7F75' }}>
          Gate 2 review →
          {typeof pendingGate2Count === 'number' && pendingGate2Count > 0 && (
            <span style={{ marginLeft: '0.25rem', color: '#c0392b' }}>({pendingGate2Count} pending)</span>
          )}
        </a>
        <a href="/admin/tags" style={{ color: '#6F7F75' }}>Manage tags →</a>
        <a href="/admin/links" style={{ color: '#6F7F75' }}>Link health →</a>
      </p>
      <ApplicationQueue applications={applications ?? []} />
    </main>
  )
}
