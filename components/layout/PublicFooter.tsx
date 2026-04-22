import { brand } from '@/lib/brand.config'

export default function PublicFooter() {
  return (
    <footer className="border-t border-soft-border bg-white mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display text-lg font-medium text-ink">{brand.name}</p>
          <p className="text-sm text-muted-text">{brand.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
