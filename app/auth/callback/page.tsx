'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
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
    const supabase = createClient()
    let cancelled = false
    let settled = false

    async function finish(session: Session | null) {
      if (cancelled || settled) return
      settled = true

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

    // Fires when the browser SDK finishes processing the #access_token= hash
    // (event: 'SIGNED_IN'). Also fires with INITIAL_SESSION which we ignore
    // unless it already has a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        finish(session)
      }
    })

    // Covers the race where the hash was processed before we subscribed —
    // SIGNED_IN would not fire again.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) finish(session)
    })

    // Give the SDK up to 5s to process the hash; otherwise treat as failure.
    const timeout = setTimeout(() => finish(null), 5000)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      clearTimeout(timeout)
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
