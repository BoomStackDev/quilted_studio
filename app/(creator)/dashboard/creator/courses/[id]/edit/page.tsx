import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CourseForm from '../../CourseForm'
import DashboardShell from '@/components/layout/DashboardShell'

const navItems = [
  { label: 'Profile', href: '/dashboard/creator/profile' },
  { label: 'Courses', href: '/dashboard/creator/courses' },
  { label: 'Videos', href: '/dashboard/creator/videos' },
]

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
    <DashboardShell title="Edit course" navItems={navItems} userEmail={user.email ?? undefined}>
      <a href="/dashboard/creator/courses" className="text-sm text-studio-sage hover:underline mb-4 inline-block">
        ← Back to courses
      </a>
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
    </DashboardShell>
  )
}
