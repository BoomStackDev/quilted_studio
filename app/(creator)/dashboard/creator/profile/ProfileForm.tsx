'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="display_name"
        label="Display name *"
        required
        value={displayName}
        onChange={e => setDisplayName(e.target.value)}
      />

      <Input
        id="tagline"
        label="Tagline"
        value={tagline}
        onChange={e => setTagline(e.target.value)}
      />

      <Textarea
        id="bio"
        label="Bio"
        rows={5}
        value={bio}
        onChange={e => setBio(e.target.value)}
      />

      <Card>
        <p className="text-sm font-medium text-ink mb-2">Profile photo</p>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="Profile"
            className="w-32 h-32 rounded-lg object-cover mb-3 border border-soft-border"
          />
        )}
        <label className="inline-block">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={photoUploading}
            className="hidden"
          />
          <span className="inline-flex items-center justify-center font-medium transition-all cursor-pointer bg-white text-ink border border-soft-border hover:bg-paper-warm-gray px-4 py-2 text-sm rounded-lg">
            {photoUploading ? 'Uploading...' : photoUrl ? 'Change photo' : 'Upload photo'}
          </span>
        </label>
      </Card>

      <Input
        id="youtube_url"
        type="url"
        label="YouTube URL"
        value={youtubeUrl}
        onChange={e => setYoutubeUrl(e.target.value)}
      />

      <Input
        id="instagram_url"
        type="url"
        label="Instagram URL"
        value={instagramUrl}
        onChange={e => setInstagramUrl(e.target.value)}
      />

      <Input
        id="website_url"
        type="url"
        label="Website URL"
        value={websiteUrl}
        onChange={e => setWebsiteUrl(e.target.value)}
      />

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
          {allTags.length === 0 && <p className="text-sm text-muted-text">No tags available yet.</p>}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">Profile saved.</p>}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={saving}
        disabled={photoUploading}
        className="self-start"
      >
        Save profile
      </Button>
    </form>
  )
}
