'use client'

import { useState } from 'react'

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
      <div>
        <h2>Application received</h2>
        <p>
          Thanks for applying. We review every application personally and will
          be in touch within a few days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label htmlFor="name">Your name *</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        />
      </div>

      <div>
        <label htmlFor="email">Email address *</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        />
      </div>

      <div>
        <label htmlFor="youtube_url">YouTube channel URL *</label>
        <input
          id="youtube_url"
          name="youtube_url"
          type="url"
          required
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        />
      </div>

      <div>
        <label htmlFor="primary_platform">Where do you currently host your courses? *</label>
        <select
          id="primary_platform"
          name="primary_platform"
          required
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        >
          <option value="">Select one</option>
          <option value="Kajabi">Kajabi</option>
          <option value="Thinkific">Thinkific</option>
          <option value="YouTube only">YouTube only — no course platform</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="referral_source">How did you hear about us?</label>
        <input
          id="referral_source"
          name="referral_source"
          type="text"
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        />
      </div>

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '0.75rem 1.5rem', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Submitting...' : 'Submit application'}
      </button>
    </form>
  )
}
