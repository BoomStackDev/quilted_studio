'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Creator = Database['public']['Tables']['creators']['Row']
type Tag = Database['public']['Tables']['specialty_tags']['Row']

type Props = {
  creator: Creator
  selectedTagIds: string[]
  allTags: Tag[]
  userId: string
}

export default function ProfileForm({ creator, selectedTagIds, allTags, userId }: Props) {
  const [displayName, setDisplayName] = useState(creator.display_name ?? '')
  const [tagline, setTagline] = useState(creator.tagline ?? '')
  const [bio, setBio] = useState(creator.bio ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(creator.youtube_url ?? '')
  const [instagramUrl, setInstagramUrl] = useState(creator.instagram_url ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(creator.website_url ?? '')
  const [photoUrl, setPhotoUrl] = useState(creator.photo_url ?? '')
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedTagIds))

  const [photoUploading, setPhotoUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const tagsByCategory = useMemo(() => {
    return allTags.reduce<Record<string, Tag[]>>((acc, t) => {
      if (!acc[t.category]) acc[t.category] = []
      acc[t.category].push(t)
      return acc
    }, {})
  }, [allTags])

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoUploading(true)
    setError(null)

    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('creator-photos')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setError(uploadError.message)
      setPhotoUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('creator-photos')
      .getPublicUrl(path)

    setPhotoUrl(urlData.publicUrl)
    setPhotoUploading(false)
  }

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

    const res = await fetch('/api/creator/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: displayName,
        tagline,
        bio,
        youtube_url: youtubeUrl,
        instagram_url: instagramUrl,
        website_url: websiteUrl,
        photo_url: photoUrl,
        tag_ids: Array.from(selected),
      }),
    })

    if (res.ok) {
      setSuccess(true)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to save profile')
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
        <label htmlFor="display_name">Display name *</label>
        <input
          id="display_name"
          type="text"
          required
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
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
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          rows={5}
          value={bio}
          onChange={e => setBio(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label>Profile photo</label>
        {photoUrl && (
          <div style={{ marginTop: '0.5rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="Profile" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          disabled={photoUploading}
          style={{ marginTop: '0.5rem' }}
        />
        {photoUploading && <p style={{ fontSize: '0.9rem', color: '#5A5A5A' }}>Uploading...</p>}
      </div>

      <div>
        <label htmlFor="youtube_url">YouTube URL</label>
        <input
          id="youtube_url"
          type="url"
          value={youtubeUrl}
          onChange={e => setYoutubeUrl(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="instagram_url">Instagram URL</label>
        <input
          id="instagram_url"
          type="url"
          value={instagramUrl}
          onChange={e => setInstagramUrl(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="website_url">Website URL</label>
        <input
          id="website_url"
          type="url"
          value={websiteUrl}
          onChange={e => setWebsiteUrl(e.target.value)}
          style={inputStyle}
        />
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
          {allTags.length === 0 && <p style={{ fontSize: '0.9rem', color: '#5A5A5A' }}>No tags available yet.</p>}
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: '#2e7d32' }}>Profile saved.</p>}

      <button
        type="submit"
        disabled={saving || photoUploading}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#6F7F75',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: saving || photoUploading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          alignSelf: 'flex-start',
        }}
      >
        {saving ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  )
}
