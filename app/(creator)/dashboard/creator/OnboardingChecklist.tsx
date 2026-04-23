'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

type ChecklistData = {
  profileComplete: boolean
  hasAffiliateCourse: boolean
  commissionConfirmed: boolean
  status: string
  published: boolean
  feedbackForCreator: string | null
}

const statusLabels: Record<string, string> = {
  approved_gate1: 'Complete your profile to submit for review',
  pending_gate2: 'Profile submitted — under review',
  approved: 'Approved — your profile is live',
  rejected: 'Application not approved',
  changes_requested: 'Changes requested — see feedback below',
}

const statusBannerClasses: Record<string, string> = {
  approved: 'bg-green-50 border-green-200',
  changes_requested: 'bg-yellow-50 border-yellow-200',
  rejected: 'bg-red-50 border-red-200',
}

export default function OnboardingChecklist({ data }: { data: ChecklistData }) {
  const commissionConfirmed = data.commissionConfirmed
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(
    ['pending_gate2', 'approved', 'rejected', 'changes_requested'].includes(data.status)
  )

  const allComplete =
    data.profileComplete &&
    data.hasAffiliateCourse &&
    commissionConfirmed

  const canSubmit = allComplete && data.status === 'approved_gate1'

  async function handleSubmitForReview() {
    setSubmitLoading(true)
    setError(null)
    const res = await fetch('/api/creator/submit-for-review', { method: 'POST' })
    if (res.ok) {
      setSubmitted(true)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Failed to submit')
    }
    setSubmitLoading(false)
  }

  const bannerClass = statusBannerClasses[data.status] ?? ''

  return (
    <div>
      <Card className={`mb-6 ${bannerClass}`}>
        <p className="font-medium text-ink m-0">
          Status: {statusLabels[data.status] ?? data.status}
        </p>
      </Card>

      {data.status === 'changes_requested' && data.feedbackForCreator && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <p className="font-medium text-ink m-0">Feedback from Dave:</p>
          <p className="text-ink mt-2 m-0">{data.feedbackForCreator}</p>
        </Card>
      )}

      <h2 className="font-display text-2xl text-ink mb-4">Onboarding checklist</h2>

      <div className="flex flex-col gap-3 mb-6">
        <ChecklistItem
          complete={data.profileComplete}
          label="Complete your profile"
          description="Add your display name, tagline, bio, and profile photo."
          action={!data.profileComplete ? { label: 'Edit profile', href: '/dashboard/creator/profile' } : undefined}
        />

        <ChecklistItem
          complete={data.hasAffiliateCourse}
          label="Add at least one affiliated course"
          description="List a course from your external platform."
          action={!data.hasAffiliateCourse ? { label: 'Add course', href: '/dashboard/creator/courses/new' } : undefined}
        />

        <ChecklistItem
          complete={commissionConfirmed}
          label="Confirm commission setup"
          description="Set up Quilted Studio as an affiliate in your platform with a minimum 90-day cookie duration."
          action={
            !commissionConfirmed
              ? { label: 'View setup instructions', href: '/dashboard/creator/commission-setup' }
              : undefined
          }
        />

        <ChecklistItem
          complete={submitted}
          label="Submit profile for review"
          description="Once all steps above are complete, submit your profile for Dave to review."
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {canSubmit && !submitted && (
        <Button variant="primary" size="lg" loading={submitLoading} onClick={handleSubmitForReview}>
          Submit for review
        </Button>
      )}

      {data.status === 'approved' && (
        <Card className="mt-6 bg-green-50 border-green-200">
          <p className="m-0 text-ink">✓ Your profile is live and visible in the directory.</p>
        </Card>
      )}
    </div>
  )
}

type ChecklistItemProps = {
  complete: boolean
  label: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    disabled?: boolean
  }
}

function ChecklistItem({ complete, label, description, action }: ChecklistItemProps) {
  return (
    <Card className={complete ? 'border-green-200 bg-green-50' : ''}>
      <div className="flex gap-3">
        <span className="text-xl leading-none text-studio-sage">{complete ? '✓' : '○'}</span>
        <div className="flex-1">
          <p className="font-medium text-ink m-0">{label}</p>
          <p className="text-sm text-muted-text mt-1 m-0">{description}</p>
          {action && !complete && (
            action.href ? (
              <a href={action.href} className="inline-block mt-2 text-sm text-studio-sage hover:underline">
                {action.label} →
              </a>
            ) : (
              <Button variant="secondary" size="sm" className="mt-2" onClick={action.onClick} disabled={action.disabled}>
                {action.label}
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  )
}
