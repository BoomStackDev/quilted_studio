import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CourseList from './CourseList'

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
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <a href="/dashboard/creator" style={{ fontSize: '0.9rem', color: '#6F7F75' }}>← Back to dashboard</a>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
        <h1 style={{ margin: 0 }}>Your courses</h1>
        <a
          href="/dashboard/creator/courses/new"
          style={{
            padding: '0.5rem 1rem',
            background: '#6F7F75',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          Add course
        </a>
      </div>
      <CourseList initialCourses={courses ?? []} />
    </main>
  )
}
