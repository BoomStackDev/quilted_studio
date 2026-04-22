type Props = {
  children: React.ReactNode
  className?: string
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const widthClasses = {
  sm: 'max-w-lg',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full',
}

export default function PageShell({ children, className = '', width = 'lg' }: Props) {
  return (
    <div className={[
      'mx-auto w-full px-4 py-8 sm:px-6 lg:px-8',
      widthClasses[width],
      className,
    ].join(' ')}>
      {children}
    </div>
  )
}
