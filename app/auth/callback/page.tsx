'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { EmailOtpType } from '@supabase/supabase-js'
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

    async function run() {
      const params = new URLSearchParams(window.location.search)
      console.log('[auth/callback] href:', window.location.href)
      console.log('[auth/callback] query params:', Object.fromEntries(new URLSearchParams(window.location.search)))
      console.log('[auth/callback] token_hash:', params.get('token_hash'), 'type:', params.get('type'))
      const next = safeNext(params.get('next'))
      const token_hash = params.get('token_hash')
      const type = params.get('type') as EmailOtpType | null

      let userId: string | null = null
      let verifyErrorMessage: string | null = null

      if (token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash, type })
        console.log('[auth/callback] verifyOtp result:', { user: data.session?.user?.id ?? null, error: error?.message ?? null })
        if (error) {
          verifyErrorMessage = error.message
        } else if (data.session?.user) {
          userId = data.session.user.id
        }
      }

      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) userId = session.user.id
      }

      if (cancelled) return

      if (!userId) {
        const code = verifyErrorMessage?.toLowerCase().includes('expired')
          ? 'link_expired'
          : 'auth_failed'
        router.replace(`/auth/signin?error=${code}`)
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
