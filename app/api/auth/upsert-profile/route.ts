import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: user.email!,
        role: 'student',
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    if (error) {
      console.error('Error upserting profile:', error)
      return NextResponse.json({ error: 'Failed to upsert profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in POST /api/auth/upsert-profile:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
