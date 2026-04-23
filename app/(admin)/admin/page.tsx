import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import ApplicationQueue from './ApplicationQueue'
import AdminShell from '@/components/layout/AdminShell'

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
    <AdminShell title="Application Queue">
      <ApplicationQueue applications={applications ?? []} />
    </AdminShell>
  )
}
