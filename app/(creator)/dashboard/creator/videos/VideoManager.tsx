'use client'

import { useState } from 'react'
import type { Database } from '@/types/supabase'

type Video = Database['public']['Tables']['creator_videos']['Row']
type Tag = Pick<Database['public']['Tables']['specialty_tags']['Row'], 'id' | 'name' | 'category' | 'level'>
type SpecialtyTagLite = { id: string; name: string; category: string; level: string } | null
type VideoWithTag = Video & { specialty_tags: SpecialtyTagLite | SpecialtyTagLite[] | null }

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const
type Level = typeof LEVELS[number]

function extractTag(video: VideoWithTag): SpecialtyTagLite {
  const t = video.specialty_tags
  if (!t) return null
  return Array.isArray(t) ? t[0] ?? null : t
}

export default function VideoManager({
  initialVideos,
  tags,
}: {
  initialVideos: VideoWithTag[]
  tags: Tag[]
}) {
  const [videos, setVideos] = useState<VideoWithTag[]>(initialVideos)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [tagId, setTagId] = useState('')
  const [level, setLevel] = useState<Level>('Beginner')
  const [adding, setAdding] = useState(false)

  const maxReached = videos.length >= 3

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAdding(true)
    setError(null)

    const res = await fetch('/api/creator/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtube_url: youtubeUrl, tag_id: tagId, level }),
    })

    if (res.ok) {
      const { video } = await res.json()
      setVideos(prev => [...prev, video])
      setYoutubeUrl('')
      setTagId('')
      setLevel('Beginner')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to add video')
    }

    setAdding(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this video?')) return

    setDeletingId(id)
    setError(null)

    const res = await fetch(`/api/creator/videos/${id}`, { method: 'DELETE' })

    if (res.ok) {
      // Re-number positions locally to match server reorder
      setVideos(prev =>
        prev
          .filter(v => v.id !== id)
          .map((v, i) => ({ ...v, position: i + 1 }))
      )
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to delete video')
    }

    setDeletingId(null)
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '0.5rem',
    marginTop: '0.25rem',
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p style={{ fontSize: '0.9rem', color: '#5A5A5A' }}>
        {videos.length} of 3 videos
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {videos.map(video => {
          const tag = extractTag(video)
          return (
            <article
              key={video.id}
              style={{
                border: '1px solid #D6CFC6',
                borderRadius: '8px',
                padding: '0.75rem',
                background: 'white',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              {video.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.thumbnail_url}
                  alt={video.title ?? 'Video thumbnail'}
                  style={{ width: '120px', height: '68px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{video.title ?? '(Untitled)'}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#5A5A5A' }}>
                  Position {video.position ?? '?'}
                  {tag && ` · ${tag.name}`}
                  {video.level && ` · ${video.level}`}
                </p>
                <a
                  href={video.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.85rem', color: '#6F7F75' }}
                >
                  View on YouTube ↗
                </a>
              </div>
              <button
                onClick={() => handleDelete(video.id)}
                disabled={deletingId === video.id}
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.85rem',
                  background: '#c0392b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: deletingId === video.id ? 'not-allowed' : 'pointer',
                }}
              >
                {deletingId === video.id ? '...' : 'Delete'}
              </button>
            </article>
          )
        })}
      </div>

      {maxReached ? (
        <p style={{ padding: '1rem', background: '#F7F4EF', border: '1px solid #EAE4DB', borderRadius: '8px' }}>
          You have reached the maximum of 3 featured videos.
        </p>
      ) : (
        <section style={{ border: '1px solid #D6CFC6', borderRadius: '8px', padding: '1rem', background: '#F7F4EF' }}>
          <h2 style={{ marginTop: 0 }}>Add a video</h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label htmlFor="youtube_url">YouTube URL</label>
              <input
                id="youtube_url"
                type="url"
                required
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="tag_id">Tag</label>
              <select
                id="tag_id"
                required
                value={tagId}
                onChange={e => setTagId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select a tag</option>
                {tags.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.category} — {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level">Level</label>
              <select
                id="level"
                value={level}
                onChange={e => setLevel(e.target.value as Level)}
                style={inputStyle}
              >
                {LEVELS.map(l => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={adding || !youtubeUrl || !tagId}
              style={{
                padding: '0.5rem 1rem',
                background: '#6F7F75',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: adding || !youtubeUrl || !tagId ? 'not-allowed' : 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              {adding ? 'Adding...' : 'Add video'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
