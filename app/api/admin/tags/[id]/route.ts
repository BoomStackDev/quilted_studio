import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  level: z.enum(LEVELS).optional(),
  active: z.boolean().optional(),
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error

    const { id } = await params
    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from('specialty_tags')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating tag:', error)
      return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
    }

    return NextResponse.json({ tag: data }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/admin/tags/[id]:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) return auth.error

    const { id } = await params

    // Soft delete — never hard delete
    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from('specialty_tags')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deactivating tag:', error)
      return NextResponse.json({ error: 'Failed to deactivate tag' }, { status: 500 })
    }

    return NextResponse.json({ tag: data }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/admin/tags/[id]:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
