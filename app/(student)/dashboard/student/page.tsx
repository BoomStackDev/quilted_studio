import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from './SignOutButton'

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Student Dashboard</h1>
      <p>Signed in as: {user.email}</p>
      <div style={{ marginTop: '1rem' }}>
        <SignOutButton />
      </div>
    </main>
  )
}
