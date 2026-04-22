import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingChecklist from './OnboardingChecklist'

export default async function CreatorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!creator) redirect('/auth/signin')

  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .eq('creator_id', user.id)
    .eq('course_type', 'affiliated')

  const checklistData = {
    profileComplete: !!(creator.display_name && creator.bio && creator.tagline && creator.photo_url),
    hasAffiliateCourse: (courses?.length ?? 0) > 0,
    commissionConfirmed: creator.confirmed_commission ?? false,
    status: creator.status,
    published: creator.published ?? false,
    feedbackForCreator: creator.feedback_for_creator,
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Creator Dashboard</h1>
      <p style={{ color: '#5A5A5A' }}>{user.email}</p>
      <nav style={{ margin: '0 0 1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
        <a href="/dashboard/creator/profile" style={{ color: '#6F7F75' }}>Profile →</a>
        <a href="/dashboard/creator/courses" style={{ color: '#6F7F75' }}>Courses →</a>
        <a href="/dashboard/creator/videos" style={{ color: '#6F7F75' }}>Videos →</a>
      </nav>
      <OnboardingChecklist data={checklistData} />
    </main>
  )
}
