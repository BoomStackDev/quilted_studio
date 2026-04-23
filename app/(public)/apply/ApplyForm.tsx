'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export default function ApplyForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      youtube_url: formData.get('youtube_url') as string,
      primary_platform: formData.get('primary_platform') as string,
      referral_source: formData.get('referral_source') as string,
    }

    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setSubmitted(true)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  if (submitted) {
    return (
      <Card>
        <h2 className="font-display text-2xl text-ink mb-2">Application received</h2>
        <p className="text-ink">
          Thanks for applying. We review every application personally and will
          be in touch within a few days.
        </p>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="name"
        name="name"
        type="text"
        label="Your name *"
        required
      />

      <Input
        id="email"
        name="email"
        type="email"
        label="Email address *"
        required
      />

      <Input
        id="youtube_url"
        name="youtube_url"
        type="url"
        label="YouTube channel URL *"
        required
      />

      <Select
        id="primary_platform"
        name="primary_platform"
        label="Where do you currently host your courses? *"
        required
        defaultValue=""
      >
        <option value="">Select one</option>
        <option value="Kajabi">Kajabi</option>
        <option value="Thinkific">Thinkific</option>
        <option value="YouTube only">YouTube only — no course platform</option>
        <option value="Other">Other</option>
      </Select>

      <Input
        id="referral_source"
        name="referral_source"
        type="text"
        label="How did you hear about us?"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" variant="primary" size="lg" loading={loading} className="self-start">
        Submit application
      </Button>
    </form>
  )
}
