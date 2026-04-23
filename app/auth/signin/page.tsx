import { Suspense } from 'react'
import { brand } from '@/lib/brand.config'
import SignInForm from './SignInForm'
import PublicShell from '@/components/layout/PublicShell'
import PageShell from '@/components/ui/PageShell'

export const metadata = {
  title: `Sign in — ${brand.name}`,
}

export default function SignInPage() {
  return (
    <PublicShell>
      <PageShell width="sm">
        <h1 className="font-display text-3xl text-ink mb-2">{brand.name}</h1>
        <p className="text-muted-text mb-6">Enter your email to receive a magic link.</p>
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </PageShell>
    </PublicShell>
  )
}
