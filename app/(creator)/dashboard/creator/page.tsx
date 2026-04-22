import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CreatorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Creator Dashboard</h1>
      <p>Signed in as: {user.email}</p>
    </main>
  )
}
