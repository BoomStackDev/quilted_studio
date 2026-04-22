import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!creator) redirect('/auth/signin')

  const { data: creatorTags } = await supabase
    .from('creator_tags')
    .select('tag_id')
    .eq('creator_id', user.id)

  const selectedTagIds = (creatorTags ?? []).map(t => t.tag_id)

  const { data: allTags } = await supabase
    .from('specialty_tags')
    .select('*')
    .eq('active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <a href="/dashboard/creator" style={{ fontSize: '0.9rem', color: '#6F7F75' }}>← Back to dashboard</a>
      <h1 style={{ marginTop: '1rem' }}>Edit profile</h1>
      <ProfileForm
        creator={creator}
        selectedTagIds={selectedTagIds}
        allTags={allTags ?? []}
        userId={user.id}
      />
    </main>
  )
}
