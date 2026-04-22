import { brand } from '@/lib/brand.config'

type Props = {
  children: React.ReactNode
  title: string
}

export default function AdminShell({ children, title }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-studio-ivory">
      <header className="border-b border-soft-border bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <a href="/" className="font-display text-lg font-medium text-ink hover:no-underline">
                {brand.name}
              </a>
              <span className="text-muted-text">Admin</span>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/admin" className="text-muted-text hover:text-ink">Queue</a>
              <a href="/admin/creators" className="text-muted-text hover:text-ink">Gate 2</a>
              <a href="/admin/tags" className="text-muted-text hover:text-ink">Tags</a>
              <a href="/admin/links" className="text-muted-text hover:text-ink">Links</a>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-display font-medium text-ink mb-6">{title}</h1>
        {children}
      </main>
    </div>
  )
}
