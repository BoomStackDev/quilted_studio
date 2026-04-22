'use client'

import { useEffect, useMemo, useState } from 'react'
import SignOutButton from './SignOutButton'

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

export default function StudentDashboard({ email, clicks, savedCourseIds, savedCourses }: Props) {
  const candidatePrompts = useMemo(() => {
    const saved = new Set(savedCourseIds)
    return clicks.filter(c => !saved.has(c.course_id))
  }, [clicks, savedCourseIds])

  // Start empty so SSR matches a state where localStorage hasn't been read yet.
  // After mount, filter out dismissed clicks.
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
      // Also add to My Other Courses immediately if not already there
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

  function handleNo(click: Click) {
    try {
      localStorage.setItem(`dismissed_click_${click.id}`, '1')
    } catch {
      // localStorage unavailable — still hide this session
    }
    setPrompts(prev => (prev ?? []).filter(c => c.id !== click.id))
  }

  const showPrompts = prompts && prompts.length > 0

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Student Dashboard</h1>
      <p style={{ color: '#5A5A5A' }}>Signed in as: {email}</p>

      {showPrompts && (
        <section style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <h2>Did you purchase?</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {prompts!.map(p => (
            <article
              key={p.id}
              style={{
                border: '1px solid #D6CFC6',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.75rem',
                background: 'white',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>Did you purchase {p.title}?</p>
              {p.tagline && (
                <p style={{ margin: '0.25rem 0 0', color: '#5A5A5A', fontSize: '0.9rem' }}>{p.tagline}</p>
              )}
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleYes(p)}
                  disabled={loadingId === p.id}
                  style={{
                    padding: '0.4rem 1rem',
                    background: '#6F7F75',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loadingId === p.id ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loadingId === p.id ? 'Saving...' : 'Yes'}
                </button>
                <button
                  onClick={() => handleNo(p)}
                  style={{
                    padding: '0.4rem 1rem',
                    background: 'white',
                    color: '#1F1F1F',
                    border: '1px solid #D6CFC6',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  No thanks
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <section style={{ marginTop: '1.5rem' }}>
        <h2>My Other Courses</h2>
        {mine.length === 0 ? (
          <p style={{ color: '#5A5A5A' }}>
            Courses you purchase through Quilted Studio will appear here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mine.map(course => (
              <article
                key={course.course_id}
                style={{
                  border: '1px solid #D6CFC6',
                  borderRadius: '8px',
                  padding: '1rem',
                  background: 'white',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{course.title}</p>
                  {course.tagline && (
                    <p style={{ margin: '0.25rem 0 0', color: '#5A5A5A', fontSize: '0.9rem' }}>
                      {course.tagline}
                    </p>
                  )}
                  {course.level && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#5A5A5A' }}>
                      Level: {course.level}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {course.slug && (
                    <a
                      href={`/go/${course.slug}`}
                      style={{
                        padding: '0.3rem 0.75rem',
                        background: '#6F7F75',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                      }}
                    >
                      View course
                    </a>
                  )}
                  <button
                    onClick={() => handleRemove(course.course_id)}
                    disabled={removingId === course.course_id}
                    style={{
                      padding: '0.3rem 0.75rem',
                      background: 'white',
                      color: '#1F1F1F',
                      border: '1px solid #D6CFC6',
                      borderRadius: '6px',
                      cursor: removingId === course.course_id ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    {removingId === course.course_id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div style={{ marginTop: '1.5rem' }}>
        <SignOutButton />
      </div>
    </main>
  )
}
