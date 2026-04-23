'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useMemo } from 'react'
import VideoCarousel, { type CarouselVideo } from './VideoCarousel'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

type TagLite = {
  id: string
  name: string
  category: string
  level: string
}

type CreatorCard = {
  id: string
  slug: string | null
  display_name: string | null
  tagline: string | null
  photo_url: string | null
  tags: TagLite[]
}

type Props = {
  creators: CreatorCard[]
  allTags: TagLite[]
  q: string
  tag: string | null
  level: string | null
  carouselVideos: CarouselVideo[]
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const

const pillActive = 'bg-studio-sage text-white border-studio-sage'
const pillInactive = 'bg-white text-muted-text border-soft-border hover:border-studio-sage'
const pillBase = 'rounded-full px-4 py-1.5 text-sm border transition-colors cursor-pointer'

export default function DirectoryClient({ creators, allTags, q, tag, level, carouselVideos }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const uniqueTagNames = useMemo(() => {
    const seen = new Map<string, TagLite>()
    for (const t of allTags) {
      if (!seen.has(t.name)) seen.set(t.name, t)
    }
    return Array.from(seen.values())
  }, [allTags])

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  function toggleTag(tagId: string) {
    updateParam('tag', tag === tagId ? null : tagId)
  }

  function toggleLevel(lvl: string) {
    updateParam('level', level === lvl ? null : lvl)
  }

  return (
    <>
      <VideoCarousel videos={carouselVideos} />

      <section className="mb-6">
        <input
          type="search"
          placeholder="Search by name or tagline..."
          defaultValue={q}
          onChange={e => updateParam('q', e.target.value)}
          className="w-full px-4 py-2 border border-soft-border rounded-lg bg-white text-ink placeholder-muted-text focus:outline-none focus:ring-2 focus:ring-studio-sage"
        />
      </section>

      <section className="mb-4">
        <p className="mb-2 text-xs text-muted-text">Level</p>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map(lvl => {
            const active = level === lvl
            return (
              <button
                key={lvl}
                onClick={() => toggleLevel(lvl)}
                className={`${pillBase} ${active ? pillActive : pillInactive}`}
              >
                {lvl}
              </button>
            )
          })}
        </div>
      </section>

      {uniqueTagNames.length > 0 && (
        <section className="mb-6">
          <p className="mb-2 text-xs text-muted-text">Specialty</p>
          <div className="flex flex-wrap gap-2">
            {uniqueTagNames.map(t => {
              const active = tag === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  className={`${pillBase} ${active ? pillActive : pillInactive}`}
                >
                  {t.name}
                </button>
              )
            })}
          </div>
        </section>
      )}

      <p className="mb-4 text-sm text-muted-text">
        {creators.length} {creators.length === 1 ? 'creator' : 'creators'}
      </p>

      {creators.length === 0 ? (
        <p className="text-center py-16 text-muted-text">No creators match these filters. Try clearing one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map(c => {
            const displayedTags = c.tags.slice(0, 3)
            const cardContent = (
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col gap-3">
                <div className="flex gap-3 items-center">
                  {c.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.photo_url}
                      alt={c.display_name ?? ''}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-paper-warm-gray flex items-center justify-center text-xl font-medium text-muted-text">
                      {(c.display_name ?? '?').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-display text-lg text-ink m-0">{c.display_name}</h3>
                </div>
                {c.tagline && (
                  <p className="text-sm text-muted-text m-0">{c.tagline}</p>
                )}
                {displayedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {displayedTags.map(t => (
                      <Badge key={t.id} variant="sage">{t.name}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            )

            return c.slug ? (
              <a key={c.id} href={`/creators/${c.slug}`} className="no-underline hover:no-underline text-ink">
                {cardContent}
              </a>
            ) : (
              <div key={c.id}>{cardContent}</div>
            )
          })}
        </div>
      )}
    </>
  )
}
