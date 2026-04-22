'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CommissionSetupForm() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!checked) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/creator/commission-confirmed', { method: 'POST' })

    if (res.ok) {
      router.push('/dashboard/creator')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
          style={{ marginTop: '0.2rem', width: '1rem', height: '1rem' }}
        />
        <span>
          I have set up {' '}
          <strong>affiliates@quilted.studio</strong>
          {' '} as an affiliate in my platform with a minimum <strong>90-day cookie duration</strong>.
        </span>
      </label>

      {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}

      <button
        onClick={handleConfirm}
        disabled={!checked || loading}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          background: checked ? '#6F7F75' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: !checked || loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
        }}
      >
        {loading ? 'Saving...' : 'Confirm and return to dashboard'}
      </button>
    </div>
  )
}
