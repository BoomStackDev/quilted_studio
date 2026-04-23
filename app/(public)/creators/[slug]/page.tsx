import { createClient } from '@/lib/supabase/server'
import { brand } from '@/lib/brand.config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PublicShell from '@/components/layout/PublicShell'
import PageShell from '@/components/ui/PageShell'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

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
  const [{ data: { user } }, { data: tagRows }, { data: courseRows }, { data: videoRows }] = await Promise.all([
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
    supabase
      .from('creator_videos')
      .select('id, youtube_url, title, thumbnail_url, level, position, specialty_tags(id, name)')
      .eq('creator_id', creator.id)
      .order('position', { ascending: true }),
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

  const videos = (videoRows ?? []).map(v => {
    const tag = Array.isArray(v.specialty_tags) ? v.specialty_tags[0] : v.specialty_tags
    return {
      id: v.id,
      youtube_url: v.youtube_url,
      title: v.title,
      thumbnail_url: v.thumbnail_url,
      level: v.level,
      tag_name: tag?.name ?? null,
    }
  })

  return (
    <PublicShell>
      <PageShell width="lg">
        <header className="flex gap-6 items-start mb-8">
          {creator.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={creator.photo_url}
              alt={creator.display_name ?? ''}
              className="w-32 h-32 rounded-full object-cover border-2 border-soft-border flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h1 className="font-display text-3xl text-ink m-0">{creator.display_name}</h1>
            {creator.tagline && (
              <p className="text-muted-text mt-1">{creator.tagline}</p>
            )}
            <div className="flex gap-4 mt-3 text-sm text-studio-sage flex-wrap">
              {creator.youtube_url && (
                <a href={creator.youtube_url} target="_blank" rel="noreferrer">YouTube</a>
              )}
              {creator.instagram_url && (
                <a href={creator.instagram_url} target="_blank" rel="noreferrer">Instagram</a>
              )}
              {creator.website_url && (
                <a href={creator.website_url} target="_blank" rel="noreferrer">Website</a>
              )}
            </div>
          </div>
        </header>

        {creator.bio && (
          <section className="mb-8">
            <h2 className="font-display text-2xl text-ink mb-4">About</h2>
            <Card>
              <p className="text-ink leading-relaxed whitespace-pre-wrap m-0">{creator.bio}</p>
            </Card>
          </section>
        )}

        {tags.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-2xl text-ink mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag.id} variant="sage">{tag.name}</Badge>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="font-display text-2xl text-ink mb-4">Courses</h2>
          {courses.length === 0 ? (
            <p className="text-muted-text text-sm">No courses listed yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <Card key={course.id} className="hover:shadow-md transition-shadow h-full flex flex-col gap-2">
                  <h3 className="font-medium text-ink m-0">{course.title}</h3>
                  {course.tagline && (
                    <p className="text-sm text-muted-text m-0">{course.tagline}</p>
                  )}
                  {course.level && (
                    <div>
                      <Badge variant="gray">{course.level}</Badge>
                    </div>
                  )}
                  {course.slug && (
                    <a
                      href={
                        isAuthed
                          ? `/go/${course.slug}`
                          : `/auth/signin?next=${encodeURIComponent(`/go/${course.slug}`)}`
                      }
                      className="mt-auto no-underline hover:no-underline"
                    >
                      <Button variant="primary" size="sm" className="w-full">
                        View course
                      </Button>
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl text-ink mb-4">Videos</h2>
          {videos.length === 0 ? (
            <p className="text-muted-text text-sm">No featured videos yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map(video => (
                <a
                  key={video.id}
                  href={video.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="no-underline hover:no-underline text-ink"
                >
                  <article className="rounded-xl overflow-hidden border border-soft-border bg-white hover:shadow-md transition-shadow">
                    {video.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={video.thumbnail_url}
                        alt={video.title ?? ''}
                        className="w-full aspect-video object-cover block"
                      />
                    )}
                    <div className="p-3">
                      <p className="font-medium text-ink m-0">{video.title ?? '(Untitled)'}</p>
                      {(video.tag_name || video.level) && (
                        <p className="text-xs text-muted-text mt-1">
                          {video.tag_name}
                          {video.tag_name && video.level && ' · '}
                          {video.level}
                        </p>
                      )}
                    </div>
                  </article>
                </a>
              ))}
            </div>
          )}
        </section>
      </PageShell>
    </PublicShell>
  )
}
