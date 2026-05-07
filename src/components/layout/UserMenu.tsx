import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  History,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Receipt,
  Settings,
  Sun,
  User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth-client'
import { getStoredTheme, setStoredTheme, type Theme } from '@/lib/theme'
import { cn } from '@/lib/utils'

const items = [
  { to: '/profile', label: 'โปรไฟล์', icon: UserIcon },
  { to: '/orders', label: 'ประวัติการสั่งซื้อ', icon: Receipt },
  { to: '/wallet', label: 'ประวัติธุรกรรม', icon: History },
  { to: '/wishlist', label: 'รายการแจ้งเตือน', icon: Heart },
  { to: '/wallet/topup', label: 'เติมเงิน', icon: Plus },
] as const

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme())
  const wrapRef = useRef<HTMLDivElement>(null)

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

  const close = () => setOpen(false)

  const setMode = (m: Theme) => {
    setTheme(m)
    setStoredTheme(m)
  }

  return (
    <div ref={wrapRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="ตั้งค่า"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Settings className="h-5 w-5" />
      </Button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 z-50 mt-1 w-60 overflow-hidden rounded-md border bg-popover p-1 shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
          )}
        >
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              onClick={close}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span>{label}</span>
            </Link>
          ))}

          <div className="my-1 h-px bg-border" />
          <div className="px-2 py-1.5">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              ธีม
            </p>
            <div className="flex gap-1 rounded-md border p-0.5">
              <ThemeChip
                label="Light"
                icon={Sun}
                active={theme === 'light'}
                onClick={() => setMode('light')}
              />
              <ThemeChip
                label="Dark"
                icon={Moon}
                active={theme === 'dark'}
                onClick={() => setMode('dark')}
              />
              <ThemeChip
                label="ระบบ"
                icon={Monitor}
                active={theme === 'system'}
                onClick={() => setMode('system')}
              />
            </div>
          </div>

          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close()
              signOut().then(() => window.location.reload())
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-popover-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      )}
    </div>
  )
}

function ThemeChip({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1 rounded-sm px-2 py-1 text-xs transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50',
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </button>
  )
}
