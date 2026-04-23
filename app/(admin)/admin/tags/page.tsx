import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import TagManager from './TagManager'
import AdminShell from '@/components/layout/AdminShell'

export default async function TagsPage() {
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

  const { data: tags } = await adminSupabase
    .from('specialty_tags')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return (
    <AdminShell title="Tag Management">
      <TagManager tags={tags ?? []} />
    </AdminShell>
  )
}
