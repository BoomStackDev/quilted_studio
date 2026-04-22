'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function safeNext(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

export default function SignInForm() {
  const searchParams = useSearchParams()
  const next = safeNext(searchParams.get('next'))

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const callbackUrl = next
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${window.location.origin}/auth/callback`

    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
      },
    })

    if (otpError) {
      setError(otpError.message)
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  if (sent) {
    return (
      <div>
        <p>Check your email — we sent a magic link to <strong>{email}</strong>.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      <button
        type="submit"
        disabled={loading || !email}
        style={{
          padding: '0.5rem 1rem',
          cursor: loading || !email ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Sending...' : 'Send magic link'}
      </button>
    </form>
  )
}
