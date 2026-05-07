import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, Wallet, Shield } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { UserMenu } from '@/components/layout/UserMenu'
import { ContactMenu } from '@/components/layout/ContactMenu'
import { useSession } from '@/lib/auth-client'
import { useCart } from '@/features/cart/cart.api'
import { useWallet } from '@/features/wallet/wallet.api'
import { cn, formatPriceTHB } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'หน้าแรก', end: true },
  { to: '/products', label: 'สินค้าทั้งหมด' },
]

export function Header() {
  const { data: session, isPending } = useSession()
  const user = session?.user as { role?: 'user' | 'admin' } | undefined
  const { data: cart } = useCart(!!session)
  const { data: wallet, isPending: walletPending } = useWallet(!!session)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" aria-label="CubbyStore">
            <Logo size="lg" />
          </Link>
          <nav className="hidden gap-4 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'text-sm transition-colors hover:text-foreground',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ContactMenu />
          <Link
            to="/cart"
            aria-label="ตะกร้า"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'relative',
            )}
          >
            <ShoppingCart className="h-5 w-5" />
            {cart && cart.count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {cart.count}
              </span>
            )}
          </Link>

          {!session && !isPending && (
            <>
              <Link
                to="/login"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              >
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className={cn(buttonVariants({ size: 'sm' }))}>
                สมัครสมาชิก
              </Link>
            </>
          )}

          {session && (
            <>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  <Shield className="mr-1 h-4 w-4" /> Admin
                </Link>
              )}
              <Link
                to="/wallet"
                aria-label="กระเป๋าเงิน"
                title={
                  wallet
                    ? `ยอดคงเหลือ ${formatPriceTHB(wallet.balance)}`
                    : 'กระเป๋าเงิน'
                }
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'gap-1.5 px-2.5 font-medium tabular-nums',
                )}
              >
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:inline">
                  {walletPending && !wallet
                    ? '…'
                    : formatPriceTHB(wallet?.balance ?? '0')}
                </span>
                <span className="sm:hidden">
                  ฿{Number(wallet?.balance ?? 0).toFixed(0)}
                </span>
              </Link>
              <UserMenu />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
