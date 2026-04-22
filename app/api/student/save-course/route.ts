import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  course_id: z.string().min(1, 'course_id is required'),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { course_id } = parsed.data

    const { data: course } = await supabase
      .from('courses')
      .select('id, course_type')
      .eq('id', course_id)
      .maybeSingle()

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.course_type !== 'affiliated') {
      return NextResponse.json({ error: 'Course is not affiliated' }, { status: 400 })
    }

    // Idempotent: skip insert if already saved
    const { data: existing } = await supabase
      .from('student_affiliated_courses')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', course_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: true, existed: true }, { status: 201 })
    }

    const { error: insertError } = await supabase
      .from('student_affiliated_courses')
      .insert({ student_id: user.id, course_id })

    if (insertError) {
      console.error('Error saving course:', insertError)
      return NextResponse.json({ error: 'Failed to save course' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/student/save-course:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
