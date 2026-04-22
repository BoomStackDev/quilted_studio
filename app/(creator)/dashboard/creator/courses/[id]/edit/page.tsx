import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CourseForm from '../../CourseForm'

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (!course || course.creator_id !== user.id) notFound()

  const { data: courseTagRows } = await supabase
    .from('course_tags')
    .select('tag_id')
    .eq('course_id', id)

  const selectedTagIds = (courseTagRows ?? []).map(r => r.tag_id)

  const { data: allTags } = await supabase
    .from('specialty_tags')
    .select('*')
    .eq('active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <a href="/dashboard/creator/courses" style={{ fontSize: '0.9rem', color: '#6F7F75' }}>← Back to courses</a>
      <h1 style={{ marginTop: '1rem' }}>Edit course</h1>
      <CourseForm
        mode="edit"
        courseId={course.id}
        initial={{
          title: course.title,
          tagline: course.tagline ?? '',
          description: course.description ?? '',
          external_url: course.external_url ?? '',
          level: course.level ?? '',
        }}
        allTags={allTags ?? []}
        selectedTagIds={selectedTagIds}
      />
    </main>
  )
}
