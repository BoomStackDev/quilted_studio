import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CourseForm from '../CourseForm'
import DashboardShell from '@/components/layout/DashboardShell'

const navItems = [
  { label: 'Profile', href: '/dashboard/creator/profile' },
  { label: 'Courses', href: '/dashboard/creator/courses' },
  { label: 'Videos', href: '/dashboard/creator/videos' },
]

export default async function NewCoursePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: allTags } = await supabase
    .from('specialty_tags')
    .select('*')
    .eq('active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return (
    <DashboardShell title="Add a course" navItems={navItems} userEmail={user.email ?? undefined}>
      <a href="/dashboard/creator/courses" className="text-sm text-studio-sage hover:underline mb-4 inline-block">
        ← Back to courses
      </a>
      <CourseForm mode="create" allTags={allTags ?? []} selectedTagIds={[]} />
    </DashboardShell>
  )
}
