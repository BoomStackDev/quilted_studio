import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Verify ownership
    const { data: existing } = await supabase
      .from('creator_videos')
      .select('id, creator_id')
      .eq('id', id)
      .single()

    if (!existing || existing.creator_id !== user.id) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('creator_videos')
      .delete()
      .eq('id', id)
      .eq('creator_id', user.id)

    if (deleteError) {
      console.error('Error deleting video:', deleteError)
      return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
    }

    // Reorder remaining videos to 1..N
    const { data: remaining, error: remainingError } = await supabase
      .from('creator_videos')
      .select('id, position')
      .eq('creator_id', user.id)
      .order('position', { ascending: true })

    if (remainingError) {
      console.error('Error fetching remaining videos for reorder:', remainingError)
      // Deletion succeeded; reorder failed — not fatal to the caller
      return NextResponse.json({ success: true }, { status: 200 })
    }

    for (let i = 0; i < (remaining ?? []).length; i++) {
      const row = remaining![i]
      const desired = i + 1
      if (row.position !== desired) {
        const { error: reorderError } = await supabase
          .from('creator_videos')
          .update({ position: desired })
          .eq('id', row.id)
          .eq('creator_id', user.id)
        if (reorderError) {
          console.error(`Error reordering video ${row.id}:`, reorderError)
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/creator/videos/[id]:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
