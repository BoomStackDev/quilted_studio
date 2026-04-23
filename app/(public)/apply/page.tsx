import { brand } from '@/lib/brand.config'
import ApplyForm from './ApplyForm'
import PublicShell from '@/components/layout/PublicShell'
import PageShell from '@/components/ui/PageShell'

export const metadata = {
  title: `Apply to list on ${brand.name}`,
}

export default function ApplyPage() {
  return (
    <PublicShell>
      <PageShell width="sm">
        <h1 className="font-display text-3xl text-ink mb-3">Apply to list on {brand.name}</h1>
        <p className="text-muted-text mb-6">
          Tell us a little about yourself and your teaching. We review every
          application personally.
        </p>
        <ApplyForm />
      </PageShell>
    </PublicShell>
  )
}
