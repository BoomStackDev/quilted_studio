import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  tagline: z.string().optional(),
  description: z.string().optional(),
  external_url: z.string().url('External URL must be a valid URL'),
  level: z.enum(LEVELS).optional(),
  tag_ids: z.array(z.string()).optional().default([]),
})

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data, error } = await supabase
      .from('courses')
      .select('*, affiliated_links(id, slug, destination_url)')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    return NextResponse.json({ courses: data ?? [] }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in GET /api/creator/courses:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { title, tagline, description, external_url, level, tag_ids } = parsed.data

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        creator_id: user.id,
        title,
        tagline: tagline || null,
        description: description || null,
        external_url,
        level: level ?? null,
        course_type: 'affiliated',
        published: false,
      })
      .select()
      .single()

    if (courseError || !course) {
      console.error('Error creating course:', courseError)
      return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
    }

    // Generate unique slug for /go/ tracker — collision-check globally
    const baseSlug = slugify(title) || course.id.slice(0, 8)
    let linkSlug = baseSlug

    const { data: existingSlug } = await supabase
      .from('affiliated_links')
      .select('id')
      .eq('slug', linkSlug)
      .maybeSingle()

    if (existingSlug) {
      linkSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`
    }

    const { data: link, error: linkError } = await supabase
      .from('affiliated_links')
      .insert({
        course_id: course.id,
        slug: linkSlug,
        destination_url: external_url,
      })
      .select()
      .single()

    if (linkError || !link) {
      console.error('Error creating affiliated link, rolling back course:', linkError)
      await supabase.from('courses').delete().eq('id', course.id)
      return NextResponse.json({ error: 'Failed to create course link' }, { status: 500 })
    }

    if (tag_ids.length > 0) {
      const { error: tagsError } = await supabase
        .from('course_tags')
        .insert(tag_ids.map(tag_id => ({ course_id: course.id, tag_id })))

      if (tagsError) {
        console.error('Error inserting course tags (course still created):', tagsError)
      }
    }

    return NextResponse.json({ course: { ...course, affiliated_links: [link] } }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/creator/courses:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
