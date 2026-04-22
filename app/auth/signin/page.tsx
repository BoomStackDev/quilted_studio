import { brand } from '@/lib/brand.config'

export default function SignInPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>{brand.name}</h1>
      <p>Enter your email to receive a magic link.</p>
      <form action="/auth/magic-link" method="POST">
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Send magic link
        </button>
      </form>
    </main>
  )
}
