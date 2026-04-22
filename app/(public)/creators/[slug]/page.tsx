import { createClient } from '@/lib/supabase/server'
import { brand } from '@/lib/brand.config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

async function getCreator(slug: string) {
  const supabase = await createClient()
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  return creator
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const creator = await getCreator(slug)

  if (!creator) {
    return { title: `Creator not found — ${brand.name}` }
  }

  return {
    title: `${creator.display_name} — ${brand.name}`,
    description: creator.tagline ?? creator.bio?.slice(0, 160) ?? undefined,
  }
}

export default async function CreatorProfilePage({ params }: Props) {
  const { slug } = await params
  const creator = await getCreator(slug)

  if (!creator) notFound()

  const supabase = await createClient()
  const [{ data: { user } }, { data: tagRows }, { data: courseRows }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('creator_tags')
      .select('specialty_tags(id, name, category, level)')
      .eq('creator_id', creator.id),
    supabase
      .from('courses')
      .select('id, title, tagline, level, published, affiliated_links(slug)')
      .eq('creator_id', creator.id)
      .eq('course_type', 'affiliated')
      .eq('published', true)
      .order('created_at', { ascending: false }),
  ])

  const isAuthed = !!user

  const tags = (tagRows ?? [])
    .map(row => row.specialty_tags)
    .filter((t): t is NonNullable<typeof t> => t !== null)

  const courses = (courseRows ?? []).map(c => ({
    id: c.id,
    title: c.title,
    tagline: c.tagline,
    level: c.level,
    slug: c.affiliated_links?.[0]?.slug ?? null,
  }))

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
        {creator.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.photo_url}
            alt={creator.display_name ?? ''}
            style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0 }}>{creator.display_name}</h1>
          {creator.tagline && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.1rem', color: '#5A5A5A' }}>{creator.tagline}</p>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {creator.youtube_url && (
              <a href={creator.youtube_url} target="_blank" rel="noreferrer" style={{ color: '#6F7F75' }}>YouTube</a>
            )}
            {creator.instagram_url && (
              <a href={creator.instagram_url} target="_blank" rel="noreferrer" style={{ color: '#6F7F75' }}>Instagram</a>
            )}
            {creator.website_url && (
              <a href={creator.website_url} target="_blank" rel="noreferrer" style={{ color: '#6F7F75' }}>Website</a>
            )}
          </div>
        </div>
      </header>

      {creator.bio && (
        <section style={{ marginBottom: '2rem' }}>
          <h2>About</h2>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{creator.bio}</p>
        </section>
      )}

      {tags.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2>Specialties</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tags.map(tag => (
              <span
                key={tag.id}
                style={{
                  padding: '0.25rem 0.75rem',
                  border: '1px solid #D6CFC6',
                  borderRadius: '9999px',
                  background: '#F7F4EF',
                  fontSize: '0.85rem',
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h2>Courses</h2>
        {courses.length === 0 ? (
          <p style={{ color: '#5A5A5A' }}>No courses listed yet.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {courses.map(course => (
              <article
                key={course.id}
                style={{
                  border: '1px solid #D6CFC6',
                  borderRadius: '12px',
                  padding: '1rem',
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <h3 style={{ margin: 0 }}>{course.title}</h3>
                {course.tagline && (
                  <p style={{ margin: 0, color: '#5A5A5A', fontSize: '0.9rem' }}>{course.tagline}</p>
                )}
                {course.level && (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#5A5A5A' }}>Level: {course.level}</p>
                )}
                {course.slug && (
                  <a
                    href={
                      isAuthed
                        ? `/go/${course.slug}`
                        : `/auth/signin?next=${encodeURIComponent(`/go/${course.slug}`)}`
                    }
                    style={{
                      marginTop: 'auto',
                      padding: '0.5rem 1rem',
                      background: '#6F7F75',
                      color: 'white',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontSize: '0.9rem',
                    }}
                  >
                    View course
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Videos section — populated in B17 */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Videos</h2>
        <div />
      </section>
    </main>
  )
}
