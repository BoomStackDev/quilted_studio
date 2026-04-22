'use client'

import { useState } from 'react'
import type { Database } from '@/types/supabase'

type Course = Database['public']['Tables']['courses']['Row']
type AffiliatedLink = Database['public']['Tables']['affiliated_links']['Row']

type CourseWithLinks = Course & {
  affiliated_links: Pick<AffiliatedLink, 'id' | 'slug' | 'destination_url'>[]
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ''

export default function CourseList({ initialCourses }: { initialCourses: CourseWithLinks[] }) {
  const [courses, setCourses] = useState<CourseWithLinks[]>(initialCourses)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this course? This cannot be undone.')) return

    setDeletingId(id)
    setError(null)

    const res = await fetch(`/api/creator/courses/${id}`, { method: 'DELETE' })

    if (res.ok) {
      setCourses(prev => prev.filter(c => c.id !== id))
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to delete course')
    }

    setDeletingId(null)
  }

  if (courses.length === 0) {
    return (
      <div style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', border: '1px dashed #D6CFC6', borderRadius: '8px' }}>
        <p style={{ margin: 0, color: '#5A5A5A' }}>No courses yet. Add your first affiliated course.</p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      {courses.map(course => {
        const link = course.affiliated_links?.[0]
        const trackingUrl = link ? `${SITE_URL}/go/${link.slug}` : '—'

        return (
          <article
            key={course.id}
            style={{
              border: '1px solid #D6CFC6',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              background: 'white',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{course.title}</h3>
                {course.tagline && (
                  <p style={{ margin: '0.25rem 0 0', color: '#5A5A5A' }}>{course.tagline}</p>
                )}
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                  {course.level && (
                    <span style={{ marginRight: '1rem', color: '#5A5A5A' }}>Level: {course.level}</span>
                  )}
                  <span style={{ color: '#5A5A5A' }}>
                    Status: {course.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                {course.external_url && (
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                    Destination: <a href={course.external_url} target="_blank" rel="noreferrer" style={{ color: '#6F7F75' }}>{course.external_url}</a>
                  </p>
                )}
                {link && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      background: '#F7F4EF',
                      border: '1px solid #EAE4DB',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <strong>Tracking URL:</strong>{' '}
                    <code style={{ fontSize: '0.85rem' }}>{trackingUrl}</code>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a
                  href={`/dashboard/creator/courses/${course.id}/edit`}
                  style={{
                    padding: '0.3rem 0.75rem',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    background: '#6B7C93',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                  }}
                >
                  Edit
                </a>
                <button
                  onClick={() => handleDelete(course.id)}
                  disabled={deletingId === course.id}
                  style={{
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.85rem',
                    background: '#c0392b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: deletingId === course.id ? 'not-allowed' : 'pointer',
                  }}
                >
                  {deletingId === course.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
