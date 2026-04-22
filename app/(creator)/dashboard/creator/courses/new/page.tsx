import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CourseForm from '../CourseForm'

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
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <a href="/dashboard/creator/courses" style={{ fontSize: '0.9rem', color: '#6F7F75' }}>← Back to courses</a>
      <h1 style={{ marginTop: '1rem' }}>Add a course</h1>
      <CourseForm mode="create" allTags={allTags ?? []} selectedTagIds={[]} />
    </main>
  )
}
