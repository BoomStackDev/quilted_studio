import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import TagManager from './TagManager'

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
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <a href="/admin" style={{ fontSize: '0.9rem', color: '#6F7F75' }}>← Back to admin</a>
      <h1 style={{ marginTop: '1rem' }}>Admin — Tag Management</h1>
      <TagManager tags={tags ?? []} />
    </main>
  )
}
