import { type SelectHTMLAttributes } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  hint?: string
}

export default function Select({ label, error, hint, id, className = '', children, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <select
        id={id}
        className={[
          'w-full px-3 py-2 text-sm bg-white border rounded-lg text-ink',
          'focus:outline-none focus:ring-2 focus:ring-studio-sage focus:border-transparent',
          error ? 'border-red-400' : 'border-soft-border',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="text-xs text-muted-text">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
