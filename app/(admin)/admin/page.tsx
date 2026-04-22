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

  const { data: applications } = await adminSupabase
    .from('creator_applications')
    .select('*')
    .order('submitted_at', { ascending: false })

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Admin — Application Queue</h1>
      <p style={{ margin: '0 0 1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <a href="/admin/tags" style={{ color: '#6F7F75' }}>Manage tags →</a>
        <a href="/admin/links" style={{ color: '#6F7F75' }}>Link health →</a>
      </p>
      <ApplicationQueue applications={applications ?? []} />
    </main>
  )
}
