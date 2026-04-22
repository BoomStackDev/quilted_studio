type Props = {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

export default function Card({ children, className = '', padding = 'md' }: Props) {
  return (
    <div className={[
      'bg-white border border-soft-border rounded-xl',
      paddingClasses[padding],
      className,
    ].join(' ')}>
      {children}
    </div>
  )
}
