'use client'

import { useState } from 'react'

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
      <p style={{ padding: '2rem', textAlign: 'center', color: '#5A5A5A' }}>
        No profiles pending review.
      </p>
    )
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {items.map(c => {
        const isLoading = loadingAction?.id === c.id
        return (
          <article
            key={c.id}
            style={{
              border: '1px solid #D6CFC6',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              background: 'white',
            }}
          >
            <header style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              {c.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.photo_url}
                  alt={c.display_name ?? ''}
                  style={{ width: '96px', height: '96px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0 }}>{c.display_name ?? '(No display name)'}</h2>
                {c.tagline && (
                  <p style={{ margin: '0.25rem 0 0', color: '#5A5A5A' }}>{c.tagline}</p>
                )}
                {c.email && (
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#5A5A5A' }}>
                    {c.email}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                  {c.youtube_url && (
                    <a href={c.youtube_url} target="_blank" rel="noreferrer" style={{ color: '#6F7F75' }}>YouTube ↗</a>
                  )}
                  {c.instagram_url && (
                    <a href={c.instagram_url} target="_blank" rel="noreferrer" style={{ color: '#6F7F75' }}>Instagram ↗</a>
                  )}
                  {c.website_url && (
                    <a href={c.website_url} target="_blank" rel="noreferrer" style={{ color: '#6F7F75' }}>Website ↗</a>
                  )}
                </div>
              </div>
            </header>

            {c.bio && (
              <section style={{ marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#5A5A5A', fontWeight: 600 }}>Bio</p>
                <p style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{c.bio}</p>
              </section>
            )}

            {c.tags.length > 0 && (
              <section style={{ marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#5A5A5A', fontWeight: 600 }}>Specialties</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                  {c.tags.map(t => (
                    <span
                      key={t.id}
                      style={{
                        padding: '0.15rem 0.6rem',
                        borderRadius: '9999px',
                        background: '#F7F4EF',
                        border: '1px solid #EAE4DB',
                        fontSize: '0.8rem',
                      }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section style={{ marginBottom: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#5A5A5A', fontWeight: 600 }}>
                Affiliated courses ({c.courses.length})
              </p>
              {c.courses.length === 0 ? (
                <p style={{ margin: '0.25rem 0 0', color: '#5A5A5A' }}>None</p>
              ) : (
                <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.2rem' }}>
                  {c.courses.map(co => (
                    <li key={co.id} style={{ marginBottom: '0.25rem' }}>
                      {co.title}
                      {co.external_url && (
                        <>
                          {' — '}
                          <a href={co.external_url} target="_blank" rel="noreferrer" style={{ color: '#6F7F75' }}>
                            {co.external_url}
                          </a>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section style={{ marginBottom: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#5A5A5A', fontWeight: 600 }}>
                Featured videos ({c.videos.length})
              </p>
              {c.videos.length === 0 ? (
                <p style={{ margin: '0.25rem 0 0', color: '#5A5A5A' }}>None</p>
              ) : (
                <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.2rem' }}>
                  {c.videos.map(v => (
                    <li key={v.id} style={{ marginBottom: '0.25rem' }}>
                      <a href={v.youtube_url} target="_blank" rel="noreferrer" style={{ color: '#6F7F75' }}>
                        {v.title ?? v.youtube_url}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label
                  htmlFor={`admin-notes-${c.id}`}
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#5A5A5A' }}
                >
                  Admin notes <span style={{ fontWeight: 400 }}>(internal only)</span>
                </label>
                <textarea
                  id={`admin-notes-${c.id}`}
                  rows={3}
                  value={adminNotes[c.id] ?? ''}
                  onChange={e => setAdminNotes(prev => ({ ...prev, [c.id]: e.target.value }))}
                  style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
                />
              </div>
              <div>
                <label
                  htmlFor={`feedback-${c.id}`}
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#5A5A5A' }}
                >
                  Feedback <span style={{ fontWeight: 400 }}>(shown to creator)</span>
                </label>
                <textarea
                  id={`feedback-${c.id}`}
                  rows={3}
                  value={feedbacks[c.id] ?? ''}
                  onChange={e => setFeedbacks(prev => ({ ...prev, [c.id]: e.target.value }))}
                  style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
                />
              </div>
            </section>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => runAction(c.id, 'approve')}
                disabled={isLoading}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#6F7F75',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {loadingAction?.id === c.id && loadingAction.action === 'approve' ? '...' : 'Approve'}
              </button>
              <button
                onClick={() => runAction(c.id, 'request-changes')}
                disabled={isLoading}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#6B7C93',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {loadingAction?.id === c.id && loadingAction.action === 'request-changes' ? '...' : 'Request Changes'}
              </button>
              <button
                onClick={() => runAction(c.id, 'reject')}
                disabled={isLoading}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#c0392b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {loadingAction?.id === c.id && loadingAction.action === 'reject' ? '...' : 'Reject'}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
