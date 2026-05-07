import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Stars({
  value,
  size = 'sm',
  className,
}: {
  value: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClass = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size]
  return (
    <div className={cn('inline-flex items-center', className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1
        const filled = value >= idx - 0.25
        return (
          <Star
            key={i}
            className={cn(
              sizeClass,
              filled
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-muted-foreground/40',
            )}
          />
        )
      })}
    </div>
  )
}

export function StarsInput({
  value,
  onChange,
  size = 'lg',
}: {
  value: number
  onChange: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size]
  return (
    <div className="inline-flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1
        const filled = value >= idx
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(idx)}
            aria-label={`${idx} ดาว`}
            className="rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Star
              className={cn(
                sizeClass,
                'transition-colors',
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-muted-foreground/40',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
