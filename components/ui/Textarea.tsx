import { type TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
}

export default function Textarea({ label, error, hint, id, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={[
          'w-full px-3 py-2 text-sm bg-white border rounded-lg text-ink placeholder-muted-text resize-y',
          'focus:outline-none focus:ring-2 focus:ring-studio-sage focus:border-transparent',
          error ? 'border-red-400' : 'border-soft-border',
          className,
        ].join(' ')}
        {...props}
      />
      {hint && !error && <p className="text-xs text-muted-text">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
