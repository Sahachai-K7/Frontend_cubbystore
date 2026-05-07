import { useEffect, useRef, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PlatformIcon,
  platformBrandColor,
  platformLabels,
} from '@/components/PlatformIcon'
import { usePublicContactLinks } from '@/features/contact/contact.api'
import { cn } from '@/lib/utils'

export function ContactMenu() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { data: links } = usePublicContactLinks()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!links || links.length === 0) return null

  return (
    <div ref={wrapRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        aria-label="ติดต่อแอดมิน"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">ติดต่อ</span>
      </Button>

      {open && (
        <div
          role="menu"
          className={cn(
            'z-50 overflow-hidden rounded-md border bg-popover p-1 shadow-lg',
            // Mobile: pin across viewport so it never overflows off-screen
            'fixed inset-x-2 top-[calc(theme(height.16)+0.25rem)] mx-auto max-w-sm',
            // Desktop: anchor to trigger button as before
            'md:absolute md:inset-x-auto md:top-auto md:right-0 md:mt-1 md:w-60',
            'animate-in fade-in-0 zoom-in-95',
          )}
        >
          <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            ติดต่อแอดมิน
          </p>
          {links.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <PlatformIcon
                platform={l.platform}
                className={cn('h-5 w-5 shrink-0', platformBrandColor[l.platform])}
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium leading-tight">{l.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {platformLabels[l.platform]}
                </span>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
