import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  level: z.enum(LEVELS),
})

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorised' }, { status: 401 }) }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user }
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from('specialty_tags')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching tags:', error)
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
    }

    return NextResponse.json({ tags: data ?? [] }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in GET /api/admin/tags:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from('specialty_tags')
      .insert(parsed.data)
      .select()
      .single()

    if (error) {
      console.error('Error creating tag:', error)
      return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
    }

    return NextResponse.json({ tag: data }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/admin/tags:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
