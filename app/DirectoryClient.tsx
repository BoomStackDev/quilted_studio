'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useMemo } from 'react'

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
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const

export default function DirectoryClient({ creators, allTags, q, tag, level }: Props) {
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
      <section style={{ marginBottom: '1.5rem' }}>
        <input
          type="search"
          placeholder="Search by name or tagline..."
          defaultValue={q}
          onChange={e => updateParam('q', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '1px solid #D6CFC6',
            borderRadius: '8px',
          }}
        />
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#5A5A5A' }}>Level</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {LEVELS.map(lvl => {
            const active = level === lvl
            return (
              <button
                key={lvl}
                onClick={() => toggleLevel(lvl)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  border: `1px solid ${active ? '#6F7F75' : '#D6CFC6'}`,
                  background: active ? '#6F7F75' : 'white',
                  color: active ? 'white' : '#1F1F1F',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {lvl}
              </button>
            )
          })}
        </div>
      </section>

      {uniqueTagNames.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#5A5A5A' }}>Specialty</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {uniqueTagNames.map(t => {
              const active = tag === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    border: `1px solid ${active ? '#6F7F75' : '#D6CFC6'}`,
                    background: active ? '#6F7F75' : 'white',
                    color: active ? 'white' : '#1F1F1F',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {t.name}
                </button>
              )
            })}
          </div>
        </section>
      )}

      <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#5A5A5A' }}>
        {creators.length} {creators.length === 1 ? 'creator' : 'creators'}
      </p>

      {creators.length === 0 ? (
        <p style={{ padding: '2rem', textAlign: 'center', color: '#5A5A5A' }}>
          No creators match these filters. Try clearing one.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {creators.map(c => {
            const displayedTags = c.tags.slice(0, 3)
            const cardContent = (
              <article
                style={{
                  border: '1px solid #D6CFC6',
                  borderRadius: '12px',
                  padding: '1rem',
                  background: 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {c.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.photo_url}
                      alt={c.display_name ?? ''}
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#EAE4DB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#5A5A5A',
                      }}
                    >
                      {(c.display_name ?? '?').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{c.display_name}</h3>
                </div>
                {c.tagline && (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#5A5A5A' }}>{c.tagline}</p>
                )}
                {displayedTags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: 'auto' }}>
                    {displayedTags.map(t => (
                      <span
                        key={t.id}
                        style={{
                          padding: '0.15rem 0.5rem',
                          fontSize: '0.75rem',
                          borderRadius: '9999px',
                          background: '#F7F4EF',
                          border: '1px solid #EAE4DB',
                        }}
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            )

            return c.slug ? (
              <a key={c.id} href={`/creators/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
