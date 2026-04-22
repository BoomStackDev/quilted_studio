'use client'

import { useState } from 'react'

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

export default function OnboardingChecklist({ data }: { data: ChecklistData }) {
  const [commissionConfirmed, setCommissionConfirmed] = useState(data.commissionConfirmed)
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

  return (
    <div>
      <div style={{ background: '#F7F4EF', border: '1px solid #D6CFC6', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, fontWeight: 600 }}>
          Status: {statusLabels[data.status] ?? data.status}
        </p>
      </div>

      {data.status === 'changes_requested' && data.feedbackForCreator && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Feedback from Dave:</p>
          <p style={{ margin: '0.5rem 0 0' }}>{data.feedbackForCreator}</p>
        </div>
      )}

      <h2>Onboarding checklist</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
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

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {canSubmit && !submitted && (
        <button
          onClick={handleSubmitForReview}
          disabled={submitLoading}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6F7F75',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: submitLoading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}
        >
          {submitLoading ? 'Submitting...' : 'Submit for review'}
        </button>
      )}

      {data.status === 'approved' && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px' }}>
          <p style={{ margin: 0 }}>✓ Your profile is live and visible in the directory.</p>
        </div>
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
    <div style={{
      display: 'flex',
      gap: '0.75rem',
      padding: '0.75rem',
      border: `1px solid ${complete ? '#a5d6a7' : '#D6CFC6'}`,
      borderRadius: '8px',
      background: complete ? '#e8f5e9' : '#FFFFFF',
    }}>
      <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{complete ? '✓' : '○'}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#5A5A5A' }}>{description}</p>
        {action && !complete && (
          action.href ? (
            <a href={action.href} style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.9rem', color: '#6F7F75' }}>
              {action.label} →
            </a>
          ) : (
            <button
              onClick={action.onClick}
              disabled={action.disabled}
              style={{
                marginTop: '0.5rem',
                padding: '0.25rem 0.75rem',
                fontSize: '0.9rem',
                background: '#6B7C93',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: action.disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  )
}
