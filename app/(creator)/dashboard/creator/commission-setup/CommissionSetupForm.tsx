'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

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
    <Card>
      <label className="flex gap-3 items-start cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
          className="mt-1 w-4 h-4 accent-studio-sage cursor-pointer"
        />
        <span className="text-ink">
          I have set up <strong>affiliates@quilted.studio</strong> as an affiliate in my
          platform with a minimum <strong>90-day cookie duration</strong>.
        </span>
      </label>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <div className="mt-4">
        <Button
          variant="primary"
          onClick={handleConfirm}
          loading={loading}
          disabled={!checked}
        >
          Confirm and return to dashboard
        </Button>
      </div>
    </Card>
  )
}
