'use client'

import { useState } from 'react'
import type { Database } from '@/types/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

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
      <Card className="text-center">
        <p className="text-muted-text m-0">No courses yet. Add your first affiliated course.</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {courses.map(course => {
        const link = course.affiliated_links?.[0]
        const trackingUrl = link ? `${SITE_URL}/go/${link.slug}` : '—'

        return (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between gap-4 items-start">
              <div className="flex-1">
                <h3 className="font-display text-xl text-ink m-0">{course.title}</h3>
                {course.tagline && (
                  <p className="text-muted-text mt-1 m-0">{course.tagline}</p>
                )}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {course.level && <Badge variant="gray">{course.level}</Badge>}
                  <Badge variant={course.published ? 'green' : 'yellow'}>
                    {course.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                {course.external_url && (
                  <p className="mt-2 text-sm text-muted-text m-0">
                    Destination:{' '}
                    <a
                      href={course.external_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-studio-sage hover:underline"
                    >
                      {course.external_url}
                    </a>
                  </p>
                )}
                {link && (
                  <p className="mt-2 text-sm text-ink m-0">
                    Tracking URL:{' '}
                    <span className="bg-paper-warm-gray px-2 py-1 rounded text-xs font-mono">
                      {trackingUrl}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <a
                  href={`/dashboard/creator/courses/${course.id}/edit`}
                  className="no-underline hover:no-underline"
                >
                  <Button variant="secondary" size="sm">Edit</Button>
                </a>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(course.id)}
                  loading={deletingId === course.id}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
