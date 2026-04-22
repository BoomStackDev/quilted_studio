import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentDashboard from './StudentDashboard'

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: clicksData }, { data: savedData }, { data: savedCoursesData }] = await Promise.all([
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
    supabase
      .from('student_affiliated_courses')
      .select('id, course_id, saved_at, courses(title, tagline, level, affiliated_links(slug))')
      .eq('student_id', user.id)
      .order('saved_at', { ascending: false }),
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

  const savedCourses = (savedCoursesData ?? []).map(row => {
    const course = Array.isArray(row.courses) ? row.courses[0] : row.courses
    const link = course
      ? Array.isArray(course.affiliated_links)
        ? course.affiliated_links[0]
        : course.affiliated_links
      : null
    return {
      id: row.id,
      course_id: row.course_id,
      title: course?.title ?? 'Course',
      tagline: course?.tagline ?? null,
      level: course?.level ?? null,
      slug: link?.slug ?? null,
      saved_at: row.saved_at,
    }
  })

  return (
    <StudentDashboard
      email={user.email ?? ''}
      clicks={clicks}
      savedCourseIds={savedCourseIds}
      savedCourses={savedCourses}
    />
  )
}
