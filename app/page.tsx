import { createClient } from '@/lib/supabase/server'
import { brand } from '@/lib/brand.config'
import DirectoryClient from './DirectoryClient'
import PublicShell from '@/components/layout/PublicShell'

type SearchParams = Promise<{
  q?: string
  tag?: string
  level?: string
}>

type TagLite = {
  id: string
  name: string
  category: string
  level: string
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { q, tag, level } = await searchParams
  const supabase = await createClient()

  let creatorsQuery = supabase
    .from('creators')
    .select('id, slug, display_name, tagline, photo_url')
    .eq('published', true)
    .order('display_name', { ascending: true })

  if (q && q.trim()) {
    const search = q.trim()
    creatorsQuery = creatorsQuery.or(`display_name.ilike.%${search}%,tagline.ilike.%${search}%`)
  }

  const [{ data: creatorsData }, { data: allTagsData }, { data: creatorTagsData }, { data: videoRows }] = await Promise.all([
    creatorsQuery,
    supabase
      .from('specialty_tags')
      .select('id, name, category, level')
      .eq('active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('creator_tags')
      .select('creator_id, specialty_tags(id, name, category, level)'),
    supabase
      .from('creator_videos')
      .select('id, youtube_url, youtube_id, title, thumbnail_url, level, creator_id, tag_id, specialty_tags(name), creators(slug, display_name, published)')
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  const tagsByCreator = new Map<string, TagLite[]>()
  for (const row of creatorTagsData ?? []) {
    const t = row.specialty_tags
    if (!t) continue
    const list = tagsByCreator.get(row.creator_id) ?? []
    list.push(t)
    tagsByCreator.set(row.creator_id, list)
  }

  let creators = (creatorsData ?? []).map(c => ({
    ...c,
    tags: tagsByCreator.get(c.id) ?? [],
  }))

  if (tag) {
    creators = creators.filter(c => c.tags.some(t => t.id === tag))
  }
  if (level) {
    creators = creators.filter(c => c.tags.some(t => t.level === level))
  }

  const carouselVideos = (videoRows ?? [])
    .map(v => {
      const creatorRel = Array.isArray(v.creators) ? v.creators[0] : v.creators
      const tagRel = Array.isArray(v.specialty_tags) ? v.specialty_tags[0] : v.specialty_tags
      if (!creatorRel?.published) return null
      return {
        id: v.id,
        youtube_url: v.youtube_url,
        title: v.title,
        thumbnail_url: v.thumbnail_url,
        level: v.level,
        tag_name: tagRel?.name ?? null,
        creator_slug: creatorRel.slug,
        creator_name: creatorRel.display_name,
      }
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-muted-text mb-6">{brand.tagline}</p>
        <DirectoryClient
          creators={creators}
          allTags={allTagsData ?? []}
          q={q ?? ''}
          tag={tag ?? null}
          level={level ?? null}
          carouselVideos={carouselVideos}
        />
      </div>
    </PublicShell>
  )
}
