'use client'
import { brand } from '@/lib/brand.config'

type Props = {
  children: React.ReactNode
  title: string
  navItems?: { label: string; href: string }[]
  userEmail?: string
}

export default function DashboardShell({ children, title, navItems = [], userEmail }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-studio-ivory">
      <header className="border-b border-soft-border bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <a href="/" className="font-display text-lg font-medium text-ink hover:no-underline">
                {brand.name}
              </a>
              {navItems.length > 0 && (
                <nav className="hidden sm:flex items-center gap-4 text-sm">
                  {navItems.map(item => (
                    <a key={item.href} href={item.href} className="text-muted-text hover:text-ink">
                      {item.label}
                    </a>
                  ))}
                </nav>
              )}
            </div>
            {userEmail && (
              <span className="text-xs text-muted-text hidden sm:block">{userEmail}</span>
            )}
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
