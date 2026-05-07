import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Boxes,
  ClipboardList,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Receipt,
  ScrollText,
  Shield,
  Star,
  Tag,
  Upload,
  Users,
  Wallet,
  Webhook,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { signOut, useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const navGroups: {
  title: string
  items: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; end?: boolean }[]
}[] = [
  {
    title: 'ภาพรวม',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'การขาย',
    items: [
      { to: '/admin/orders', label: 'คำสั่งซื้อ', icon: Receipt },
      { to: '/admin/reviews', label: 'รีวิว', icon: Star },
      { to: '/admin/users', label: 'ผู้ใช้', icon: Users },
    ],
  },
  {
    title: 'แคตตาล็อก',
    items: [
      { to: '/admin/categories', label: 'หมวดหมู่', icon: FolderTree },
      { to: '/admin/products', label: 'สินค้า', icon: Package },
      { to: '/admin/products/bulk', label: 'Bulk import', icon: Upload },
    ],
  },
  {
    title: 'การตลาด',
    items: [
      { to: '/admin/promo-codes', label: 'Promo codes', icon: Tag },
    ],
  },
  {
    title: 'การเงิน',
    items: [
      { to: '/admin/payment-config', label: 'PromptPay', icon: Wallet },
      { to: '/admin/webhook-config', label: 'Webhook', icon: Webhook },
      { to: '/admin/webhook-events', label: 'Webhook log', icon: ScrollText },
    ],
  },
  {
    title: 'ตั้งค่าเว็บ',
    items: [
      { to: '/admin/contact-links', label: 'ช่องทางติดต่อ', icon: MessageCircle },
      { to: '/admin/ip-allowlist', label: 'IP allowlist', icon: Shield },
      { to: '/admin/audit-log', label: 'Audit log', icon: ClipboardList },
    ],
  },
]

export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  // Close drawer on route change (mobile)
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  // Lock body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [drawerOpen])

  return (
    <div className="min-h-dvh bg-muted/20">
      <ScrollToTop />
      <AdminTopBar onOpenDrawer={() => setDrawerOpen(true)} />

      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar drawerOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="pt-16 md:pl-60">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function AdminTopBar({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const { data: session } = useSession()
  const name = (session?.user as { name?: string } | undefined)?.name
  const email = session?.user?.email

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-2 border-b bg-background px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="เปิดเมนู"
        onClick={onOpenDrawer}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Link to="/admin" aria-label="CubbyStore Admin">
        <Logo size="lg" subtitle="Admin" />
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          ดูเว็บลูกค้า
        </Link>
        <div className="hidden text-right text-xs leading-tight md:block">
          <div className="font-medium">{name ?? email}</div>
          {name && (
            <div className="text-muted-foreground">{email}</div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="ออกจากระบบ"
          onClick={() => signOut().then(() => (window.location.href = '/login'))}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

function Sidebar({
  drawerOpen,
  onClose,
}: {
  drawerOpen: boolean
  onClose: () => void
}) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r bg-background transition-transform md:top-16 md:translate-x-0',
        drawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
    >
      {/* Mobile-only header inside drawer */}
      <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
        <span className="font-semibold tracking-tight">เมนู Admin</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="ปิดเมนู"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
          <Boxes className="h-3.5 w-3.5 shrink-0" />
          <span>เปิดให้แอดมิน + IP ที่อนุญาตเท่านั้น</span>
        </div>
      </div>
    </aside>
  )
}

