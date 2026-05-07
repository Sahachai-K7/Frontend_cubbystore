import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

const wordSize: Record<LogoSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export function Logo({
  size = 'md',
  subtitle,
  className,
}: {
  size?: LogoSize
  subtitle?: string
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex flex-col leading-tight select-none', className)}
    >
      <span className={cn('font-bold tracking-tight', wordSize[size])}>
        <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
          Cubby
        </span>
        <span className="text-foreground">Store</span>
      </span>
      {subtitle && (
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {subtitle}
        </span>
      )}
    </span>
  )
}
