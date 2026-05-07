import { NavLink } from 'react-router-dom'
import {
  Home,
  LogIn,
  Package,
  ShoppingCart,
  User as UserIcon,
  Wallet,
} from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { useCart } from '@/features/cart/cart.api'
import { cn } from '@/lib/utils'

type Tab = {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  end?: boolean
  badge?: number
  sublabel?: string
}

export function BottomNav() {
  const { data: session } = useSession()
  const { data: cart } = useCart(!!session)

  const tabs: Tab[] = session
    ? [
        { to: '/', label: 'หน้าแรก', icon: Home, end: true },
        { to: '/products', label: 'สินค้า', icon: Package },
        {
          to: '/cart',
          label: 'ตะกร้า',
          icon: ShoppingCart,
          badge: cart?.count,
        },
        { to: '/wallet', label: 'กระเป๋า', icon: Wallet },
        { to: '/profile', label: 'บัญชี', icon: UserIcon },
      ]
    : [
        { to: '/', label: 'หน้าแรก', icon: Home, end: true },
        { to: '/products', label: 'สินค้า', icon: Package },
        { to: '/cart', label: 'ตะกร้า', icon: ShoppingCart },
        { to: '/login', label: 'เข้าสู่ระบบ', icon: LogIn },
      ]

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              <span className="relative">
                <tab.icon className="h-5 w-5" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-none text-primary-foreground">
                    {tab.badge}
                  </span>
                )}
              </span>
              <span className="truncate">{tab.label}</span>
              {tab.sublabel && (
                <span className="truncate text-[9px] tabular-nums opacity-70">
                  {tab.sublabel}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
