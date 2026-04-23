import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { brand } from '@/lib/brand.config'
import CommissionSetupForm from './CommissionSetupForm'
import DashboardShell from '@/components/layout/DashboardShell'

const navItems = [
  { label: 'Profile', href: '/dashboard/creator/profile' },
  { label: 'Courses', href: '/dashboard/creator/courses' },
  { label: 'Videos', href: '/dashboard/creator/videos' },
]

export default async function CommissionSetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: creator } = await supabase
    .from('creators')
    .select('confirmed_commission')
    .eq('id', user.id)
    .single()

  if (!creator) redirect('/auth/signin')

  if (creator.confirmed_commission) redirect('/dashboard/creator')

  return (
    <DashboardShell title="Commission setup" navItems={navItems} userEmail={user.email ?? undefined}>
      <a href="/dashboard/creator" className="text-sm text-studio-sage hover:underline mb-4 inline-block">
        ← Back to dashboard
      </a>

      <div className="space-y-4 text-ink">
        <p>
          {brand.name} earns a commission when a student purchases your course after clicking
          through from our platform. For this to work, you need to add {brand.name} as an
          affiliate in your course platform with a <strong>minimum 90-day cookie duration</strong>.
        </p>
        <p>
          The 90-day window reflects how your audience shops — quilting students often take
          weeks or months to decide on a course. A 30-day cookie would miss most of those sales.
          This is a requirement, not a suggestion.
        </p>
      </div>

      <hr className="my-6 border-soft-border" />

      <section className="space-y-2">
        <h2 className="font-display text-2xl text-ink">Kajabi</h2>
        <ol className="list-decimal pl-6 space-y-1 text-ink">
          <li>Log in to Kajabi and go to <strong>Settings → Affiliates</strong></li>
          <li>Click <strong>Add Affiliate</strong></li>
          <li>Enter the {brand.name} affiliate email: <strong>affiliates@quilted.studio</strong></li>
          <li>Set the commission rate as agreed</li>
          <li>Set the cookie duration to <strong>90 days minimum</strong></li>
          <li>Save and activate the affiliate</li>
        </ol>
      </section>

      <section className="space-y-2 mt-6">
        <h2 className="font-display text-2xl text-ink">Thinkific</h2>
        <ol className="list-decimal pl-6 space-y-1 text-ink">
          <li>Log in to Thinkific and go to <strong>Promote → Affiliate Program</strong></li>
          <li>Enable your affiliate program if not already active</li>
          <li>Click <strong>Add Affiliate</strong> and enter the {brand.name} affiliate email: <strong>affiliates@quilted.studio</strong></li>
          <li>Set commission rate as agreed</li>
          <li>Check your Thinkific plan — cookie duration settings vary by plan. Set to <strong>90 days</strong> where available</li>
          <li>Save the affiliate</li>
        </ol>
      </section>

      <section className="space-y-2 mt-6">
        <h2 className="font-display text-2xl text-ink">Other platforms</h2>
        <p className="text-ink">
          If you use a different platform, the process will be similar. Look for an
          Affiliates or Partner section in your platform settings. The key requirements are:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-ink">
          <li>Add <strong>affiliates@quilted.studio</strong> as an affiliate</li>
          <li>Set cookie duration to <strong>90 days minimum</strong></li>
          <li>Set commission rate as agreed</li>
        </ul>
        <p className="text-ink">
          If your platform does not support affiliate tracking or 90-day cookies,
          contact Dave before proceeding.
        </p>
      </section>

      <hr className="my-6 border-soft-border" />

      <CommissionSetupForm />
    </DashboardShell>
  )
}
