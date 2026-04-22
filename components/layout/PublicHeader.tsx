import { brand } from '@/lib/brand.config'
import { createClient } from '@/lib/supabase/server'

export default async function PublicHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b border-soft-border bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="font-display text-xl font-medium text-ink hover:no-underline">
            {brand.name}
          </a>
          <nav className="flex items-center gap-6 text-sm">
            <a href="/apply" className="text-muted-text hover:text-ink">List your courses</a>
            {user ? (
              <a href="/dashboard/student" className="text-studio-sage font-medium">My dashboard</a>
            ) : (
              <a href="/auth/signin" className="text-studio-sage font-medium">Sign in</a>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
