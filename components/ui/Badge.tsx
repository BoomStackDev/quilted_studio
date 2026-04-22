type Variant = 'sage' | 'blue' | 'gray' | 'green' | 'yellow' | 'red'

const variantClasses: Record<Variant, string> = {
  sage: 'bg-studio-sage/10 text-studio-sage',
  blue: 'bg-slate-blue/10 text-slate-blue',
  gray: 'bg-paper-warm-gray text-muted-text',
  green: 'bg-green-50 text-green-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  red: 'bg-red-50 text-red-600',
}

type Props = {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

export default function Badge({ children, variant = 'gray', className = '' }: Props) {
  return (
    <span className={[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
      className,
    ].join(' ')}>
      {children}
    </span>
  )
}
