import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const

const createSchema = z.object({
  youtube_url: z.string().url('Valid YouTube URL is required'),
  tag_id: z.string().min(1, 'Tag is required'),
  level: z.enum(LEVELS),
})

function extractYouTubeId(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl)
    const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '')

    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return id || null
    }

    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') {
        return u.searchParams.get('v') || null
      }
      const match = u.pathname.match(/^\/(shorts|embed)\/([^/?]+)/)
      if (match) return match[2]
    }

    return null
  } catch {
    return null
  }
}

type YouTubeSnippet = {
  title?: string
  thumbnails?: {
    default?: { url?: string }
    medium?: { url?: string }
    high?: { url?: string }
  }
}

async function fetchYouTubeSnippet(videoId: string): Promise<YouTubeSnippet | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    const json = (await res.json()) as { items?: Array<{ snippet?: YouTubeSnippet }> }
    const snippet = json.items?.[0]?.snippet
    return snippet ?? null
  } catch (err) {
    console.error('YouTube API fetch failed:', err)
    return null
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data, error } = await supabase
      .from('creator_videos')
      .select('*, specialty_tags(id, name, category, level)')
      .eq('creator_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching creator videos:', error)
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }

    return NextResponse.json({ videos: data ?? [] }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in GET /api/creator/videos:', err)
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

    const { youtube_url, tag_id, level } = parsed.data

    const youtubeId = extractYouTubeId(youtube_url)
    if (!youtubeId) {
      return NextResponse.json({ error: 'Could not read a YouTube video ID from that URL' }, { status: 400 })
    }

    // Enforce 3-video cap server-side
    const { data: existing, error: countError } = await supabase
      .from('creator_videos')
      .select('id, position')
      .eq('creator_id', user.id)
      .order('position', { ascending: true })

    if (countError) {
      console.error('Error counting videos:', countError)
      return NextResponse.json({ error: 'Failed to load existing videos' }, { status: 500 })
    }

    if ((existing?.length ?? 0) >= 3) {
      return NextResponse.json({ error: 'Maximum 3 videos allowed' }, { status: 400 })
    }

    const snippet = await fetchYouTubeSnippet(youtubeId)
    if (!snippet) {
      return NextResponse.json(
        { error: 'We could not load that video from YouTube. Check the URL is public and try again.' },
        { status: 400 }
      )
    }

    const title = snippet.title ?? null
    const thumbnail_url =
      snippet.thumbnails?.high?.url ??
      snippet.thumbnails?.medium?.url ??
      snippet.thumbnails?.default?.url ??
      null

    const nextPosition = (existing?.length ?? 0) + 1

    const { data: inserted, error: insertError } = await supabase
      .from('creator_videos')
      .insert({
        creator_id: user.id,
        youtube_url,
        youtube_id: youtubeId,
        tag_id,
        level,
        position: nextPosition,
        title,
        thumbnail_url,
      })
      .select('*, specialty_tags(id, name, category, level)')
      .single()

    if (insertError || !inserted) {
      console.error('Error inserting creator video:', insertError)
      return NextResponse.json({ error: 'Failed to save video' }, { status: 500 })
    }

    return NextResponse.json({ video: inserted }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/creator/videos:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
