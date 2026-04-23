'use client'

export type CarouselVideo = {
  id: string
  youtube_url: string
  title: string | null
  thumbnail_url: string | null
  level: string | null
  tag_name: string | null
  creator_slug: string | null
  creator_name: string | null
}

export default function VideoCarousel({ videos }: { videos: CarouselVideo[] }) {
  if (videos.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="font-display text-2xl font-medium text-ink mb-4">Featured Videos</h2>
      <div
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory"
      >
        {videos.map(video => (
          <article
            key={video.id}
            className="w-64 flex-shrink-0 snap-start"
          >
            <a
              href={video.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="relative block rounded-lg overflow-hidden aspect-video bg-ink"
              aria-label={video.title ? `Watch ${video.title} on YouTube` : 'Watch on YouTube'}
            >
              {video.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.thumbnail_url}
                  alt={video.title ?? ''}
                  className="w-full h-full object-cover block"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center text-white text-3xl bg-black/20 hover:bg-black/30 transition-colors">
                ▶
              </div>
            </a>
            <p className="text-sm font-medium text-ink mt-2 line-clamp-2">{video.title ?? '(Untitled)'}</p>
            {(video.tag_name || video.level) && (
              <p className="text-xs text-muted-text mt-0.5">
                {video.tag_name}
                {video.tag_name && video.level && ' · '}
                {video.level}
              </p>
            )}
            {video.creator_slug && video.creator_name && (
              <a
                href={`/creators/${video.creator_slug}`}
                className="text-xs text-studio-sage hover:underline mt-1 block"
              >
                {video.creator_name}
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
