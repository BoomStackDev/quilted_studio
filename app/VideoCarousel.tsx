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
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ margin: '0 0 0.75rem' }}>Featured Videos</h2>
      <style>{`
        .video-carousel-strip::-webkit-scrollbar { display: none; }
      `}</style>
      <div
        className="video-carousel-strip"
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          padding: '0.5rem 0',
          scrollbarWidth: 'none',
        }}
      >
        {videos.map(video => (
          <article
            key={video.id}
            style={{
              flex: 'none',
              width: '260px',
              scrollSnapAlign: 'start',
              border: '1px solid #D6CFC6',
              borderRadius: '12px',
              background: 'white',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <a
              href={video.youtube_url}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'block', position: 'relative', aspectRatio: '16 / 9', background: '#1F1F1F' }}
              aria-label={video.title ? `Watch ${video.title} on YouTube` : 'Watch on YouTube'}
            >
              {video.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.thumbnail_url}
                  alt={video.title ?? ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '2.25rem',
                    color: 'rgba(255, 255, 255, 0.95)',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  ▶
                </span>
              </div>
            </a>
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{video.title ?? '(Untitled)'}</p>
              {(video.tag_name || video.level) && (
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#5A5A5A' }}>
                  {video.tag_name}
                  {video.tag_name && video.level && ' · '}
                  {video.level}
                </p>
              )}
              {video.creator_slug && video.creator_name && (
                <a
                  href={`/creators/${video.creator_slug}`}
                  style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#6F7F75' }}
                >
                  {video.creator_name}
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
