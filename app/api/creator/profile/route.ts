import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  tagline: z.string().optional(),
  bio: z.string().optional(),
  youtube_url: z.string().url().optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  photo_url: z.string().url().optional().or(z.literal('')),
  tag_ids: z.array(z.string()).default([]),
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const parsed = profileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { display_name, tagline, bio, youtube_url, instagram_url, website_url, photo_url, tag_ids } = parsed.data

    // Generate slug — check for uniqueness and suffix with a random 4-digit number if taken
    const baseSlug = slugify(display_name)
    let slug = baseSlug || user.id.slice(0, 8)

    const { data: existingSlug } = await supabase
      .from('creators')
      .select('id')
      .eq('slug', slug)
      .neq('id', user.id)
      .maybeSingle()

    if (existingSlug) {
      slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`
    }

    const { data: creator, error: updateError } = await supabase
      .from('creators')
      .update({
        display_name,
        tagline: tagline || null,
        bio: bio || null,
        youtube_url: youtube_url || null,
        instagram_url: instagram_url || null,
        website_url: website_url || null,
        photo_url: photo_url || null,
        slug,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating creator profile:', updateError)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }

    // Replace creator_tags — delete existing then insert new
    const { error: deleteError } = await supabase
      .from('creator_tags')
      .delete()
      .eq('creator_id', user.id)

    if (deleteError) {
      console.error('Error clearing creator tags:', deleteError)
      return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 })
    }

    if (tag_ids.length > 0) {
      const { error: insertError } = await supabase
        .from('creator_tags')
        .insert(tag_ids.map(tag_id => ({ creator_id: user.id, tag_id })))

      if (insertError) {
        console.error('Error inserting creator tags:', insertError)
        return NextResponse.json({ error: 'Failed to save tags' }, { status: 500 })
      }
    }

    return NextResponse.json({ creator }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in POST /api/creator/profile:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
