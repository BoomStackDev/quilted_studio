'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

type Tag = Database['public']['Tables']['specialty_tags']['Row']

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const
type Level = typeof LEVELS[number]

type Initial = {
  title: string
  tagline: string
  description: string
  external_url: string
  level: string
}

type Props =
  | {
      mode: 'create'
      allTags: Tag[]
      selectedTagIds: string[]
      courseId?: never
      initial?: never
    }
  | {
      mode: 'edit'
      courseId: string
      initial: Initial
      allTags: Tag[]
      selectedTagIds: string[]
    }

export default function CourseForm(props: Props) {
  const router = useRouter()
  const initial: Initial =
    props.mode === 'edit'
      ? props.initial
      : { title: '', tagline: '', description: '', external_url: '', level: '' }

  const [title, setTitle] = useState(initial.title)
  const [tagline, setTagline] = useState(initial.tagline)
  const [description, setDescription] = useState(initial.description)
  const [externalUrl, setExternalUrl] = useState(initial.external_url)
  const [level, setLevel] = useState(initial.level)
  const [selected, setSelected] = useState<Set<string>>(new Set(props.selectedTagIds))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const tagsByCategory = useMemo(() => {
    return props.allTags.reduce<Record<string, Tag[]>>((acc, t) => {
      if (!acc[t.category]) acc[t.category] = []
      acc[t.category].push(t)
      return acc
    }, {})
  }, [props.allTags])

  function toggleTag(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const payload: Record<string, unknown> = {
      title,
      tagline,
      description,
      external_url: externalUrl,
      tag_ids: Array.from(selected),
    }
    if (level) payload.level = level

    const url = props.mode === 'create'
      ? '/api/creator/courses'
      : `/api/creator/courses/${props.courseId}`
    const method = props.mode === 'create' ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      if (props.mode === 'create') {
        router.push('/dashboard/creator/courses')
        router.refresh()
      } else {
        setSuccess(true)
      }
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to save course')
    }

    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '0.5rem',
    marginTop: '0.25rem',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
      <div>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="tagline">Tagline</label>
        <input
          id="tagline"
          type="text"
          value={tagline}
          onChange={e => setTagline(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={5}
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="external_url">External course URL *</label>
        <input
          id="external_url"
          type="url"
          required
          value={externalUrl}
          onChange={e => setExternalUrl(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="level">Level</label>
        <select
          id="level"
          value={level}
          onChange={e => setLevel(e.target.value as Level | '')}
          style={inputStyle}
        >
          <option value="">—</option>
          {LEVELS.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Specialty tags</label>
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Object.entries(tagsByCategory).map(([category, tags]) => (
            <div key={category}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#5A5A5A' }}>{category}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {tags.map(tag => {
                  const isSelected = selected.has(tag.id)
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        border: `1px solid ${isSelected ? '#6F7F75' : '#D6CFC6'}`,
                        borderRadius: '9999px',
                        background: isSelected ? '#6F7F75' : 'white',
                        color: isSelected ? 'white' : '#1F1F1F',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {props.allTags.length === 0 && (
            <p style={{ fontSize: '0.9rem', color: '#5A5A5A' }}>No tags available yet.</p>
          )}
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: '#2e7d32' }}>Course saved.</p>}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6F7F75',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}
        >
          {saving ? 'Saving...' : props.mode === 'create' ? 'Create course' : 'Save changes'}
        </button>
        <a
          href="/dashboard/creator/courses"
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #D6CFC6',
            borderRadius: '8px',
            color: '#1F1F1F',
            textDecoration: 'none',
            fontSize: '1rem',
          }}
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
