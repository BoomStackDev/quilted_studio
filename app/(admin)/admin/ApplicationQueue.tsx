'use client'

import { useState } from 'react'
import type { Database } from '@/types/supabase'

type Application = Database['public']['Tables']['creator_applications']['Row']

export default function ApplicationQueue({ applications }: { applications: Application[] }) {
  const [items, setItems] = useState(applications)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const pending = items.filter(a => a.status === 'pending')
  const reviewed = items.filter(a => a.status !== 'pending')

  async function handleAction(id: string, action: 'approve' | 'hold' | 'reject') {
    setLoadingId(id)
    setError(null)

    const body = action === 'approve' ? {} : { admin_notes: notes[id] ?? '' }

    const res = await fetch(`/api/admin/applications/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setItems(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, status: action === 'approve' ? 'approved' : action === 'hold' ? 'held' : 'rejected' }
            : a
        )
      )
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    }

    setLoadingId(null)
  }

  return (
    <div>
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      <h2>Pending ({pending.length})</h2>
      {pending.length === 0 && <p>No pending applications.</p>}
      {pending.map(app => (
        <div key={app.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <p><strong>{app.name}</strong> — {app.email}</p>
          <p>YouTube: <a href={app.youtube_url ?? '#'} target="_blank" rel="noreferrer">{app.youtube_url}</a></p>
          <p>Platform: {app.primary_platform}</p>
          <p>Referral: {app.referral_source ?? '—'}</p>
          <p style={{ fontSize: '0.85rem', color: '#666' }}>
            Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}
          </p>
          <textarea
            placeholder="Admin notes (required for Hold)"
            value={notes[app.id] ?? ''}
            onChange={e => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
            rows={2}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleAction(app.id, 'approve')}
              disabled={loadingId === app.id}
              style={{ padding: '0.5rem 1rem', background: '#6F7F75', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              {loadingId === app.id ? '...' : 'Approve'}
            </button>
            <button
              onClick={() => handleAction(app.id, 'hold')}
              disabled={loadingId === app.id}
              style={{ padding: '0.5rem 1rem', background: '#6B7C93', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              {loadingId === app.id ? '...' : 'Hold'}
            </button>
            <button
              onClick={() => handleAction(app.id, 'reject')}
              disabled={loadingId === app.id}
              style={{ padding: '0.5rem 1rem', background: '#c0392b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              {loadingId === app.id ? '...' : 'Reject'}
            </button>
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: '2rem' }}>Reviewed ({reviewed.length})</h2>
      {reviewed.length === 0 && <p>No reviewed applications yet.</p>}
      {reviewed.map(app => (
        <div key={app.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem', opacity: 0.7 }}>
          <p><strong>{app.name}</strong> — {app.email} — <em>{app.status}</em></p>
          <p style={{ fontSize: '0.85rem', color: '#666' }}>
            Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}
          </p>
        </div>
      ))}
    </div>
  )
}
