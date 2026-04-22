import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { brand } from '@/lib/brand.config'
import CommissionSetupForm from './CommissionSetupForm'

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
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <a href="/dashboard/creator" style={{ fontSize: '0.9rem', color: '#6F7F75' }}>← Back to dashboard</a>
      <h1 style={{ marginTop: '1rem' }}>Commission setup</h1>
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

      <hr style={{ margin: '1.5rem 0', borderColor: '#D6CFC6' }} />

      <h2>Kajabi</h2>
      <ol>
        <li>Log in to Kajabi and go to <strong>Settings → Affiliates</strong></li>
        <li>Click <strong>Add Affiliate</strong></li>
        <li>Enter the {brand.name} affiliate email: <strong>affiliates@quilted.studio</strong></li>
        <li>Set the commission rate as agreed</li>
        <li>Set the cookie duration to <strong>90 days minimum</strong></li>
        <li>Save and activate the affiliate</li>
      </ol>

      <h2>Thinkific</h2>
      <ol>
        <li>Log in to Thinkific and go to <strong>Promote → Affiliate Program</strong></li>
        <li>Enable your affiliate program if not already active</li>
        <li>Click <strong>Add Affiliate</strong> and enter the {brand.name} affiliate email: <strong>affiliates@quilted.studio</strong></li>
        <li>Set commission rate as agreed</li>
        <li>Check your Thinkific plan — cookie duration settings vary by plan. Set to <strong>90 days</strong> where available</li>
        <li>Save the affiliate</li>
      </ol>

      <h2>Other platforms</h2>
      <p>
        If you use a different platform, the process will be similar. Look for an
        Affiliates or Partner section in your platform settings. The key requirements are:
      </p>
      <ul>
        <li>Add <strong>affiliates@quilted.studio</strong> as an affiliate</li>
        <li>Set cookie duration to <strong>90 days minimum</strong></li>
        <li>Set commission rate as agreed</li>
      </ul>
      <p>
        If your platform does not support affiliate tracking or 90-day cookies,
        contact Dave before proceeding.
      </p>

      <hr style={{ margin: '1.5rem 0', borderColor: '#D6CFC6' }} />

      <CommissionSetupForm />
    </main>
  )
}
