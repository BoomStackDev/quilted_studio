'use client'

import { useState } from 'react'
import type { Database } from '@/types/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'

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
      <Card className="mb-8">
        <h2 className="font-display text-xl text-ink m-0 mb-4">Add a tag</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <Input
              placeholder="Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <Input
              placeholder="Category"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <Select
              value={newLevel}
              onChange={e => setNewLevel(e.target.value as Level)}
            >
              {LEVELS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={addLoading}
            disabled={!newName || !newCategory}
          >
            Add tag
          </Button>
        </form>
      </Card>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {Object.keys(grouped).length === 0 && (
        <Card className="text-center text-muted-text">No tags yet.</Card>
      )}

      {Object.entries(grouped).map(([category, categoryTags]) => (
        <section key={category} className="mb-6">
          <h2 className="font-display text-xl text-ink mb-3 pb-1 border-b border-soft-border">{category}</h2>
          <div className="flex flex-col">
            {categoryTags.map(tag => {
              const isInactive = tag.active === false
              return (
                <div
                  key={tag.id}
                  className={`flex items-center gap-3 py-2 px-1 border-b border-paper-warm-gray last:border-0 ${isInactive ? 'opacity-60' : ''}`}
                >
                  {editingId === tag.id ? (
                    <>
                      <div className="flex-1">
                        <Input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRename(tag.id)}
                        loading={loadingId === tag.id}
                      >
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-ink">{tag.name}</span>
                      <Badge variant="gray">{tag.level}</Badge>
                      <Badge variant={isInactive ? 'red' : 'green'}>
                        {isInactive ? 'inactive' : 'active'}
                      </Badge>
                      <Button variant="secondary" size="sm" onClick={() => startEdit(tag)} disabled={loadingId === tag.id}>
                        Rename
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleActive(tag)}
                        loading={loadingId === tag.id}
                      >
                        {isInactive ? 'Reactivate' : 'Deactivate'}
                      </Button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
