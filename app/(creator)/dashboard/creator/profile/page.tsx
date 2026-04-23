import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'
import DashboardShell from '@/components/layout/DashboardShell'

const navItems = [
  { label: 'Profile', href: '/dashboard/creator/profile' },
  { label: 'Courses', href: '/dashboard/creator/courses' },
  { label: 'Videos', href: '/dashboard/creator/videos' },
]

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
    <DashboardShell title="Edit profile" navItems={navItems} userEmail={user.email ?? undefined}>
      <a href="/dashboard/creator" className="text-sm text-studio-sage hover:underline mb-4 inline-block">
        ← Back to dashboard
      </a>
      <ProfileForm
        creator={creator}
        selectedTagIds={selectedTagIds}
        allTags={allTags ?? []}
        userId={user.id}
      />
    </DashboardShell>
  )
}
