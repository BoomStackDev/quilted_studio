import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VideoManager from './VideoManager'

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
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <a href="/dashboard/creator" style={{ fontSize: '0.9rem', color: '#6F7F75' }}>← Back to dashboard</a>
      <h1 style={{ marginTop: '1rem' }}>Featured videos</h1>
      <p style={{ color: '#5A5A5A' }}>Pick up to 3 YouTube videos to feature on your public profile.</p>
      <VideoManager initialVideos={videos ?? []} tags={tags ?? []} />
    </main>
  )
}
