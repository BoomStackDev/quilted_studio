import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import type { Database } from '@/types/supabase'

type CourseUpdate = Database['public']['Tables']['courses']['Update']

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  external_url: z.string().url().optional(),
  level: z.enum(LEVELS).optional(),
  tag_ids: z.array(z.string()).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('courses')
      .select('id, creator_id')
      .eq('id', id)
      .single()

    if (!existing || existing.creator_id !== user.id) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const { tag_ids, ...courseFields } = parsed.data

    const updatePayload: CourseUpdate = {}
    if (courseFields.title !== undefined) updatePayload.title = courseFields.title
    if (courseFields.tagline !== undefined) updatePayload.tagline = courseFields.tagline || null
    if (courseFields.description !== undefined) updatePayload.description = courseFields.description || null
    if (courseFields.external_url !== undefined) updatePayload.external_url = courseFields.external_url
    if (courseFields.level !== undefined) updatePayload.level = courseFields.level
    updatePayload.updated_at = new Date().toISOString()

    const { data: course, error: updateError } = await supabase
      .from('courses')
      .update(updatePayload)
      .eq('id', id)
      .eq('creator_id', user.id)
      .select()
      .single()

    if (updateError || !course) {
      console.error('Error updating course:', updateError)
      return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
    }

    // If external_url changed, sync to affiliated_links
    if (courseFields.external_url !== undefined) {
      const { error: linkError } = await supabase
        .from('affiliated_links')
        .update({ destination_url: courseFields.external_url })
        .eq('course_id', id)

      if (linkError) {
        console.error('Error updating affiliated_link destination:', linkError)
      }
    }

    // If tag_ids was provided, replace the set
    if (tag_ids !== undefined) {
      const { error: deleteError } = await supabase
        .from('course_tags')
        .delete()
        .eq('course_id', id)

      if (deleteError) {
        console.error('Error clearing course tags:', deleteError)
        return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 })
      }

      if (tag_ids.length > 0) {
        const { error: insertError } = await supabase
          .from('course_tags')
          .insert(tag_ids.map(tag_id => ({ course_id: id, tag_id })))

        if (insertError) {
          console.error('Error inserting course tags:', insertError)
          return NextResponse.json({ error: 'Failed to save tags' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ course }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/creator/courses/[id]:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: existing } = await supabase
      .from('courses')
      .select('id, creator_id')
      .eq('id', id)
      .single()

    if (!existing || existing.creator_id !== user.id) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
      .eq('creator_id', user.id)

    if (error) {
      console.error('Error deleting course:', error)
      return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/creator/courses/[id]:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
