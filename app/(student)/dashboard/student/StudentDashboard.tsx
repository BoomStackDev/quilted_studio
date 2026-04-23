'use client'

import { useEffect, useMemo, useState } from 'react'
import SignOutButton from './SignOutButton'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

type Click = {
  id: string
  course_id: string
  clicked_at: string | null
  title: string
  tagline: string | null
  slug: string | null
}

type SavedCourse = {
  id: string
  course_id: string
  title: string
  tagline: string | null
  level: string | null
  slug: string | null
  saved_at: string | null
}

type Props = {
  email: string
  clicks: Click[]
  savedCourseIds: string[]
  savedCourses: SavedCourse[]
}

export default function StudentDashboard({ clicks, savedCourseIds, savedCourses }: Props) {
  const candidatePrompts = useMemo(() => {
    const saved = new Set(savedCourseIds)
    return clicks.filter(c => !saved.has(c.course_id))
  }, [clicks, savedCourseIds])

  const [prompts, setPrompts] = useState<Click[] | null>(null)
  const [mine, setMine] = useState<SavedCourse[]>(savedCourses)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const filtered = candidatePrompts.filter(c => {
      try {
        return !localStorage.getItem(`dismissed_click_${c.id}`)
      } catch {
        return true
      }
    })
    setPrompts(filtered)
  }, [candidatePrompts])

  async function handleYes(click: Click) {
    setLoadingId(click.id)
    setError(null)

    const res = await fetch('/api/student/save-course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: click.course_id }),
    })

    if (res.ok) {
      setPrompts(prev => (prev ?? []).filter(c => c.id !== click.id))
      setMine(prev => {
        if (prev.some(m => m.course_id === click.course_id)) return prev
        const optimistic: SavedCourse = {
          id: `optimistic-${click.id}`,
          course_id: click.course_id,
          title: click.title,
          tagline: click.tagline,
          level: null,
          slug: click.slug,
          saved_at: new Date().toISOString(),
        }
        return [optimistic, ...prev]
      })
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to save')
    }

    setLoadingId(null)
  }

  function handleNo(click: Click) {
    try {
      localStorage.setItem(`dismissed_click_${click.id}`, '1')
    } catch {
      // localStorage unavailable — still hide this session
    }
    setPrompts(prev => (prev ?? []).filter(c => c.id !== click.id))
  }

  async function handleRemove(course_id: string) {
    setRemovingId(course_id)
    setError(null)

    const res = await fetch(`/api/student/save-course/${course_id}`, { method: 'DELETE' })

    if (res.ok) {
      setMine(prev => prev.filter(c => c.course_id !== course_id))
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to remove course')
    }

    setRemovingId(null)
  }

  const showPrompts = prompts && prompts.length > 0

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {showPrompts && (
        <section className="mb-8">
          <h2 className="font-display text-2xl text-ink mb-4">Did you purchase?</h2>
          <div className="flex flex-col gap-3">
            {prompts!.map(p => (
              <Card key={p.id}>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-ink m-0">Did you purchase {p.title}?</p>
                    {p.tagline && (
                      <p className="text-sm text-muted-text mt-1 m-0">{p.tagline}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleYes(p)}
                      loading={loadingId === p.id}
                    >
                      Yes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNo(p)}
                    >
                      No thanks
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="font-display text-2xl text-ink mb-4 mt-8">My Other Courses</h2>
        {mine.length === 0 ? (
          <Card className="text-muted-text text-center py-8">
            Courses you purchase through Quilted Studio will appear here.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {mine.map(course => (
              <Card key={course.course_id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-ink m-0">{course.title}</p>
                    {course.tagline && (
                      <p className="text-sm text-muted-text mt-1 m-0">{course.tagline}</p>
                    )}
                    {course.level && (
                      <div className="mt-2">
                        <Badge variant="gray">{course.level}</Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {course.slug && (
                      <a href={`/go/${course.slug}`} className="no-underline hover:no-underline">
                        <Button variant="primary" size="sm">View course</Button>
                      </a>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemove(course.course_id)}
                      loading={removingId === course.course_id}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8">
        <SignOutButton />
      </div>
    </div>
  )
}
