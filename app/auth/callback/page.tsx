'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PageShell from '@/components/ui/PageShell'

function safeNext(raw: string | null): string {
  if (!raw) return '/dashboard/student'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard/student'
  return raw
}

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function run() {
      const supabase = createClient()

      // Implicit flow: the browser client detects the access_token in the URL
      // hash and sets the session. getSession returns it once available.
      const { data: { session } } = await supabase.auth.getSession()

      if (cancelled) return

      const params = new URLSearchParams(window.location.search)
      const next = safeNext(params.get('next'))

      if (!session?.user) {
        router.replace('/auth/signin?error=auth_failed')
        return
      }

      try {
        await fetch('/api/auth/upsert-profile', { method: 'POST' })
      } catch (err) {
        console.error('Failed to upsert profile after signin:', err)
      }

      if (cancelled) return
      router.replace(next)
    }

    run()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <PageShell width="sm">
      <div className="text-center py-16">
        <p className="text-muted-text">Signing you in...</p>
      </div>
    </PageShell>
  )
}
