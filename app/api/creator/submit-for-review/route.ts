import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Verify all checklist items are complete before allowing submission
    const { data: creator } = await supabase
      .from('creators')
      .select('display_name, bio, tagline, photo_url, confirmed_commission, status')
      .eq('id', user.id)
      .single()

    if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

    if (creator.status !== 'approved_gate1') {
      return NextResponse.json({ error: 'Not eligible for Gate 2 review' }, { status: 400 })
    }

    const profileComplete = !!(creator.display_name && creator.bio && creator.tagline && creator.photo_url)
    if (!profileComplete) {
      return NextResponse.json({ error: 'Profile is not complete' }, { status: 400 })
    }

    if (!creator.confirmed_commission) {
      return NextResponse.json({ error: 'Commission setup not confirmed' }, { status: 400 })
    }

    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('creator_id', user.id)
      .eq('course_type', 'affiliated')
      .limit(1)

    if (!courses || courses.length === 0) {
      return NextResponse.json({ error: 'No affiliated courses listed' }, { status: 400 })
    }

    const { error } = await supabase
      .from('creators')
      .update({ status: 'pending_gate2' })
      .eq('id', user.id)

    if (error) {
      console.error('Error submitting for review:', error)
      return NextResponse.json({ error: 'Failed to submit for review' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
