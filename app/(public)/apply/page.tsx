import { brand } from '@/lib/brand.config'
import ApplyForm from './ApplyForm'

export const metadata = {
  title: `Apply to list on ${brand.name}`,
}

export default function ApplyPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '560px', margin: '0 auto' }}>
      <h1>Apply to list on {brand.name}</h1>
      <p>
        Tell us a little about yourself and your teaching. We review every
        application personally.
      </p>
      <ApplyForm />
    </main>
  )
}
