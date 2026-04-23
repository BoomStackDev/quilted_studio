import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingChecklist from './OnboardingChecklist'
import DashboardShell from '@/components/layout/DashboardShell'

const navItems = [
  { label: 'Profile', href: '/dashboard/creator/profile' },
  { label: 'Courses', href: '/dashboard/creator/courses' },
  { label: 'Videos', href: '/dashboard/creator/videos' },
]

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
    <DashboardShell title="Creator Dashboard" navItems={navItems} userEmail={user.email ?? undefined}>
      <OnboardingChecklist data={checklistData} />
    </DashboardShell>
  )
}
