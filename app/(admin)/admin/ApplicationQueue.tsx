'use client'

import { useState } from 'react'
import type { Database } from '@/types/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Badge from '@/components/ui/Badge'

type Application = Database['public']['Tables']['creator_applications']['Row']

const statusVariant: Record<string, 'sage' | 'green' | 'yellow' | 'red' | 'gray'> = {
  pending: 'sage',
  approved: 'green',
  held: 'yellow',
  rejected: 'red',
}

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
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <section className="mb-8">
        <h2 className="font-display text-2xl text-ink mb-4">Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <Card className="text-muted-text text-center">No pending applications.</Card>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map(app => (
              <Card key={app.id} className="border-studio-sage/40">
                <p className="m-0 text-ink"><strong>{app.name}</strong> — {app.email}</p>
                {app.youtube_url && (
                  <p className="m-0 mt-1 text-sm">
                    YouTube:{' '}
                    <a href={app.youtube_url} target="_blank" rel="noreferrer" className="text-studio-sage hover:underline">
                      {app.youtube_url}
                    </a>
                  </p>
                )}
                <p className="m-0 mt-1 text-sm text-ink">Platform: {app.primary_platform}</p>
                <p className="m-0 mt-1 text-sm text-ink">Referral: {app.referral_source ?? '—'}</p>
                <p className="m-0 mt-2 text-xs text-muted-text">
                  Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}
                </p>
                <div className="mt-3">
                  <Textarea
                    placeholder="Admin notes (required for Hold)"
                    value={notes[app.id] ?? ''}
                    onChange={e => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAction(app.id, 'approve')}
                    loading={loadingId === app.id}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAction(app.id, 'hold')}
                    loading={loadingId === app.id}
                  >
                    Hold
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleAction(app.id, 'reject')}
                    loading={loadingId === app.id}
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink mb-4">Reviewed ({reviewed.length})</h2>
        {reviewed.length === 0 ? (
          <Card className="text-muted-text text-center">No reviewed applications yet.</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {reviewed.map(app => (
              <Card key={app.id} padding="sm">
                <div className="flex justify-between items-center gap-3 flex-wrap">
                  <div>
                    <p className="m-0 text-ink"><strong>{app.name}</strong> — {app.email}</p>
                    <p className="m-0 text-xs text-muted-text mt-0.5">
                      Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <Badge variant={statusVariant[app.status] ?? 'gray'}>{app.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
