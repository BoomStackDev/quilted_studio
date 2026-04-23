'use client'

import { useState } from 'react'
import type { Database } from '@/types/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

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

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-sm text-muted-text m-0">{videos.length} of 3 videos</p>

      <div className="flex flex-col gap-3">
        {videos.map(video => {
          const tag = extractTag(video)
          return (
            <Card key={video.id}>
              <div className="flex gap-3 items-start">
                {video.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnail_url}
                    alt={video.title ?? 'Video thumbnail'}
                    className="w-32 h-20 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-ink m-0">{video.title ?? '(Untitled)'}</p>
                  <p className="text-sm text-muted-text mt-1 m-0">
                    Position {video.position ?? '?'}
                    {tag && ` · ${tag.name}`}
                    {video.level && ` · ${video.level}`}
                  </p>
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-studio-sage hover:underline mt-1 inline-block"
                  >
                    View on YouTube ↗
                  </a>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(video.id)}
                  loading={deletingId === video.id}
                >
                  Delete
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {maxReached ? (
        <Card>
          <p className="text-muted-text m-0">You have reached the maximum of 3 featured videos.</p>
        </Card>
      ) : (
        <Card>
          <h2 className="font-display text-xl text-ink m-0 mb-4">Add a video</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <Input
              id="youtube_url"
              type="url"
              label="YouTube URL"
              required
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />

            <Select
              id="tag_id"
              label="Tag"
              required
              value={tagId}
              onChange={e => setTagId(e.target.value)}
            >
              <option value="">Select a tag</option>
              {tags.map(t => (
                <option key={t.id} value={t.id}>
                  {t.category} — {t.name}
                </option>
              ))}
            </Select>

            <Select
              id="level"
              label="Level"
              value={level}
              onChange={e => setLevel(e.target.value as Level)}
            >
              {LEVELS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>

            <Button
              type="submit"
              variant="primary"
              loading={adding}
              disabled={!youtubeUrl || !tagId}
              className="self-start"
            >
              Add video
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
