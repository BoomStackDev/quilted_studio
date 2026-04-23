'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="title"
        label="Title *"
        required
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <Input
        id="tagline"
        label="Tagline"
        value={tagline}
        onChange={e => setTagline(e.target.value)}
      />

      <Textarea
        id="description"
        label="Description"
        rows={5}
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <Input
        id="external_url"
        type="url"
        label="External course URL *"
        required
        value={externalUrl}
        onChange={e => setExternalUrl(e.target.value)}
      />

      <Select
        id="level"
        label="Level"
        value={level}
        onChange={e => setLevel(e.target.value as Level | '')}
      >
        <option value="">—</option>
        {LEVELS.map(l => (
          <option key={l} value={l}>{l}</option>
        ))}
      </Select>

      <div>
        <p className="text-sm font-medium text-ink mb-2">Specialty tags</p>
        <div className="flex flex-col gap-3">
          {Object.entries(tagsByCategory).map(([category, tags]) => (
            <div key={category}>
              <p className="text-xs text-muted-text mb-1.5">{category}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                  const isSelected = selected.has(tag.id)
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-full px-3 py-1 text-sm border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-studio-sage text-white border-studio-sage'
                          : 'bg-white text-muted-text border-soft-border hover:border-studio-sage'
                      }`}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {props.allTags.length === 0 && (
            <p className="text-sm text-muted-text">No tags available yet.</p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">Course saved.</p>}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="lg" loading={saving}>
          {props.mode === 'create' ? 'Create course' : 'Save changes'}
        </Button>
        <a href="/dashboard/creator/courses" className="no-underline hover:no-underline">
          <Button type="button" variant="ghost" size="lg">
            Cancel
          </Button>
        </a>
      </div>
    </form>
  )
}
