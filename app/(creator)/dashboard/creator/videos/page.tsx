import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VideoManager from './VideoManager'
import DashboardShell from '@/components/layout/DashboardShell'

const navItems = [
  { label: 'Profile', href: '/dashboard/creator/profile' },
  { label: 'Courses', href: '/dashboard/creator/courses' },
  { label: 'Videos', href: '/dashboard/creator/videos' },
]

export default async function VideosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const [{ data: videos }, { data: tags }] = await Promise.all([
    supabase
      .from('creator_videos')
      .select('*, specialty_tags(id, name, category, level)')
      .eq('creator_id', user.id)
      .order('position', { ascending: true }),
    supabase
      .from('specialty_tags')
      .select('id, name, category, level')
      .eq('active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true }),
  ])

  return (
    <DashboardShell title="Featured videos" navItems={navItems} userEmail={user.email ?? undefined}>
      <a href="/dashboard/creator" className="text-sm text-studio-sage hover:underline mb-4 inline-block">
        ← Back to dashboard
      </a>
      <p className="text-muted-text mb-6">Pick up to 3 YouTube videos to feature on your public profile.</p>
      <VideoManager initialVideos={videos ?? []} tags={tags ?? []} />
    </DashboardShell>
  )
}
