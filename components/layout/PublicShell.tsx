import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-studio-ivory">
      <PublicHeader />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
