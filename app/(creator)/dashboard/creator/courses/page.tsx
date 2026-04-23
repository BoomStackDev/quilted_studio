import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CourseList from './CourseList'
import DashboardShell from '@/components/layout/DashboardShell'

const navItems = [
  { label: 'Profile', href: '/dashboard/creator/profile' },
  { label: 'Courses', href: '/dashboard/creator/courses' },
  { label: 'Videos', href: '/dashboard/creator/videos' },
]

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: courses } = await supabase
    .from('courses')
    .select('*, affiliated_links(id, slug, destination_url)')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardShell title="Your courses" navItems={navItems} userEmail={user.email ?? undefined}>
      <div className="flex items-center justify-between mb-4">
        <a href="/dashboard/creator" className="text-sm text-studio-sage hover:underline">
          ← Back to dashboard
        </a>
        <a href="/dashboard/creator/courses/new" className="no-underline hover:no-underline">
          <span className="inline-flex items-center justify-center font-medium transition-all cursor-pointer bg-studio-sage text-white hover:opacity-90 px-4 py-2 text-sm rounded-lg">
            Add course
          </span>
        </a>
      </div>
      <CourseList initialCourses={courses ?? []} />
    </DashboardShell>
  )
}
