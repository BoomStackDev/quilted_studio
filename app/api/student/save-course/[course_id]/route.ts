import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ course_id: string }> }
) {
  try {
    const { course_id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data, error } = await supabase
      .from('student_affiliated_courses')
      .delete()
      .eq('student_id', user.id)
      .eq('course_id', course_id)
      .select('id')

    if (error) {
      console.error('Error removing saved course:', error)
      return NextResponse.json({ error: 'Failed to remove course' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/student/save-course/[course_id]:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
