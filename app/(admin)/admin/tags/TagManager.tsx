'use client'

import { useState } from 'react'
import type { Database } from '@/types/supabase'

type Tag = Database['public']['Tables']['specialty_tags']['Row']

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const
type Level = typeof LEVELS[number]

export default function TagManager({ tags }: { tags: Tag[] }) {
  const [items, setItems] = useState<Tag[]>(tags)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newLevel, setNewLevel] = useState<Level>('All Levels')
  const [addLoading, setAddLoading] = useState(false)

  const grouped = items.reduce<Record<string, Tag[]>>((acc, t) => {
    const key = t.category
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddLoading(true)
    setError(null)

    const res = await fetch('/api/admin/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, category: newCategory, level: newLevel }),
    })

    if (res.ok) {
      const { tag } = await res.json()
      setItems(prev => [...prev, tag])
      setNewName('')
      setNewCategory('')
      setNewLevel('All Levels')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to create tag')
    }

    setAddLoading(false)
  }

  async function handleToggleActive(tag: Tag) {
    setLoadingId(tag.id)
    setError(null)

    const nextActive = !(tag.active ?? true)
    const method = nextActive ? 'PATCH' : 'DELETE'
    const res = await fetch(`/api/admin/tags/${tag.id}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'PATCH' ? JSON.stringify({ active: true }) : undefined,
    })

    if (res.ok) {
      const { tag: updated } = await res.json()
      setItems(prev => prev.map(t => (t.id === tag.id ? updated : t)))
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to update tag')
    }

    setLoadingId(null)
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return
    setLoadingId(id)
    setError(null)

    const res = await fetch(`/api/admin/tags/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })

    if (res.ok) {
      const { tag: updated } = await res.json()
      setItems(prev => prev.map(t => (t.id === id ? updated : t)))
      setEditingId(null)
      setEditName('')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to rename tag')
    }

    setLoadingId(null)
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id)
    setEditName(tag.name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  return (
    <div>
      <section style={{ border: '1px solid #D6CFC6', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', background: '#F7F4EF' }}>
        <h2 style={{ marginTop: 0 }}>Add a tag</h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
            style={{ flex: '1 1 180px', padding: '0.5rem' }}
          />
          <input
            type="text"
            placeholder="Category"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            required
            style={{ flex: '1 1 180px', padding: '0.5rem' }}
          />
          <select
            value={newLevel}
            onChange={e => setNewLevel(e.target.value as Level)}
            style={{ flex: '1 1 140px', padding: '0.5rem' }}
          >
            {LEVELS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={addLoading || !newName || !newCategory}
            style={{
              padding: '0.5rem 1rem',
              background: '#6F7F75',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: addLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {addLoading ? 'Adding...' : 'Add tag'}
          </button>
        </form>
      </section>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      {Object.keys(grouped).length === 0 && <p>No tags yet.</p>}

      {Object.entries(grouped).map(([category, categoryTags]) => (
        <section key={category} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ borderBottom: '1px solid #D6CFC6', paddingBottom: '0.25rem' }}>{category}</h2>
          {categoryTags.map(tag => (
            <div
              key={tag.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                borderBottom: '1px solid #EAE4DB',
                opacity: tag.active === false ? 0.5 : 1,
              }}
            >
              {editingId === tag.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={{ flex: 1, padding: '0.25rem 0.5rem' }}
                  />
                  <button
                    onClick={() => handleRename(tag.id)}
                    disabled={loadingId === tag.id}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                  >
                    {loadingId === tag.id ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={loadingId === tag.id}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontWeight: 600 }}>{tag.name}</span>
                  <span style={{ fontSize: '0.85rem', color: '#5A5A5A' }}>{tag.level}</span>
                  <span style={{ fontSize: '0.85rem', color: tag.active === false ? '#c0392b' : '#6F7F75' }}>
                    {tag.active === false ? 'inactive' : 'active'}
                  </span>
                  <button
                    onClick={() => startEdit(tag)}
                    disabled={loadingId === tag.id}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleToggleActive(tag)}
                    disabled={loadingId === tag.id}
                    style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.9rem',
                      background: tag.active === false ? '#6F7F75' : '#c0392b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loadingId === tag.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loadingId === tag.id ? '...' : tag.active === false ? 'Reactivate' : 'Deactivate'}
                  </button>
                </>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
