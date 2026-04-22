import { Suspense } from 'react'
import { brand } from '@/lib/brand.config'
import SignInForm from './SignInForm'

export const metadata = {
  title: `Sign in — ${brand.name}`,
}

export default function SignInPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>{brand.name}</h1>
      <p>Enter your email to receive a magic link.</p>
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </main>
  )
}
