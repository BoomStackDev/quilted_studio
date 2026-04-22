import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentDashboard from './StudentDashboard'

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: clicksData }, { data: savedData }] = await Promise.all([
    supabase
      .from('affiliated_clicks')
      .select('id, course_id, clicked_at, courses(title, tagline), affiliated_links(slug)')
      .eq('student_id', user.id)
      .gte('clicked_at', sevenDaysAgo)
      .order('clicked_at', { ascending: false }),
    supabase
      .from('student_affiliated_courses')
      .select('course_id')
      .eq('student_id', user.id),
  ])

  const clicks = (clicksData ?? []).map(row => {
    const course = Array.isArray(row.courses) ? row.courses[0] : row.courses
    const link = Array.isArray(row.affiliated_links) ? row.affiliated_links[0] : row.affiliated_links
    return {
      id: row.id,
      course_id: row.course_id,
      clicked_at: row.clicked_at,
      title: course?.title ?? 'Course',
      tagline: course?.tagline ?? null,
      slug: link?.slug ?? null,
    }
  })

  const savedCourseIds = (savedData ?? []).map(s => s.course_id)

  return (
    <StudentDashboard
      email={user.email ?? ''}
      clicks={clicks}
      savedCourseIds={savedCourseIds}
    />
  )
}
