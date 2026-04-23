'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Badge from '@/components/ui/Badge'

type ReviewCreator = {
  id: string
  display_name: string | null
  tagline: string | null
  bio: string | null
  photo_url: string | null
  youtube_url: string | null
  instagram_url: string | null
  website_url: string | null
  slug: string | null
  email: string | null
  tags: { id: string; name: string }[]
  courses: { id: string; title: string; external_url: string | null }[]
  videos: { id: string; title: string | null; youtube_url: string }[]
}

type Action = 'approve' | 'request-changes' | 'reject'

const sectionLabel = 'text-sm font-medium text-muted-text uppercase tracking-wide mb-2'

export default function CreatorReviewQueue({ creators }: { creators: ReviewCreator[] }) {
  const [items, setItems] = useState<ReviewCreator[]>(creators)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})
  const [loadingAction, setLoadingAction] = useState<{ id: string; action: Action } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runAction(id: string, action: Action) {
    setLoadingAction({ id, action })
    setError(null)

    let url = ''
    let body: unknown = undefined

    if (action === 'approve') {
      url = `/api/admin/creators/${id}/approve`
    } else if (action === 'request-changes') {
      const feedback = (feedbacks[id] ?? '').trim()
      if (!feedback) {
        setError('Feedback is required when requesting changes.')
        setLoadingAction(null)
        return
      }
      url = `/api/admin/creators/${id}/request-changes`
      body = { feedback }
    } else {
      url = `/api/admin/creators/${id}/reject`
      body = { admin_notes: (adminNotes[id] ?? '').trim() || undefined }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (res.ok) {
      setItems(prev => prev.filter(c => c.id !== id))
    } else {
      const data = await res.json()
      setError(data.error ?? 'Action failed')
    }

    setLoadingAction(null)
  }

  if (items.length === 0) {
    return (
      <Card className="text-center text-muted-text">No profiles pending review.</Card>
    )
  }

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex flex-col gap-6">
        {items.map(c => {
          const isLoading = loadingAction?.id === c.id
          return (
            <Card key={c.id} padding="lg">
              <header className="flex gap-4 items-start mb-4">
                {c.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.photo_url}
                    alt={c.display_name ?? ''}
                    className="w-24 h-24 rounded-full object-cover border border-soft-border flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h2 className="font-display text-2xl text-ink m-0">{c.display_name ?? '(No display name)'}</h2>
                  {c.tagline && (
                    <p className="text-muted-text mt-1 m-0">{c.tagline}</p>
                  )}
                  {c.email && (
                    <p className="text-xs text-muted-text mt-1 m-0">{c.email}</p>
                  )}
                  <div className="flex gap-3 mt-2 flex-wrap text-sm">
                    {c.youtube_url && (
                      <a href={c.youtube_url} target="_blank" rel="noreferrer" className="text-studio-sage hover:underline">YouTube ↗</a>
                    )}
                    {c.instagram_url && (
                      <a href={c.instagram_url} target="_blank" rel="noreferrer" className="text-studio-sage hover:underline">Instagram ↗</a>
                    )}
                    {c.website_url && (
                      <a href={c.website_url} target="_blank" rel="noreferrer" className="text-studio-sage hover:underline">Website ↗</a>
                    )}
                  </div>
                </div>
              </header>

              {c.bio && (
                <section className="mb-4">
                  <p className={sectionLabel}>Bio</p>
                  <p className="text-ink whitespace-pre-wrap leading-relaxed m-0">{c.bio}</p>
                </section>
              )}

              {c.tags.length > 0 && (
                <section className="mb-4">
                  <p className={sectionLabel}>Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {c.tags.map(t => (
                      <Badge key={t.id} variant="sage">{t.name}</Badge>
                    ))}
                  </div>
                </section>
              )}

              <section className="mb-4">
                <p className={sectionLabel}>Affiliated courses ({c.courses.length})</p>
                {c.courses.length === 0 ? (
                  <p className="text-sm text-muted-text m-0">None</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1 m-0">
                    {c.courses.map(co => (
                      <li key={co.id} className="text-sm text-ink">
                        {co.title}
                        {co.external_url && (
                          <>
                            {' — '}
                            <a href={co.external_url} target="_blank" rel="noreferrer" className="text-studio-sage hover:underline">
                              {co.external_url}
                            </a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="mb-4">
                <p className={sectionLabel}>Featured videos ({c.videos.length})</p>
                {c.videos.length === 0 ? (
                  <p className="text-sm text-muted-text m-0">None</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1 m-0">
                    {c.videos.map(v => (
                      <li key={v.id} className="text-sm">
                        <a href={v.youtube_url} target="_blank" rel="noreferrer" className="text-studio-sage hover:underline">
                          {v.title ?? v.youtube_url}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <Textarea
                  label="Admin notes (internal only)"
                  rows={3}
                  value={adminNotes[c.id] ?? ''}
                  onChange={e => setAdminNotes(prev => ({ ...prev, [c.id]: e.target.value }))}
                />
                <Textarea
                  label="Feedback for creator"
                  rows={3}
                  value={feedbacks[c.id] ?? ''}
                  onChange={e => setFeedbacks(prev => ({ ...prev, [c.id]: e.target.value }))}
                />
              </section>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="primary"
                  onClick={() => runAction(c.id, 'approve')}
                  loading={isLoading && loadingAction?.action === 'approve'}
                  disabled={isLoading}
                >
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => runAction(c.id, 'request-changes')}
                  loading={isLoading && loadingAction?.action === 'request-changes'}
                  disabled={isLoading}
                >
                  Request Changes
                </Button>
                <Button
                  variant="danger"
                  onClick={() => runAction(c.id, 'reject')}
                  loading={isLoading && loadingAction?.action === 'reject'}
                  disabled={isLoading}
                >
                  Reject
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
