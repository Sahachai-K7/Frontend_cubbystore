import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import {
  PlatformIcon,
  platformBrandColor,
} from '@/components/PlatformIcon'
import { usePublicContactLinks } from '@/features/contact/contact.api'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

export function Footer() {
  const { data: links } = usePublicContactLinks()
  const { data: session } = useSession()

  const productLinks = [
    { to: '/products', label: 'สินค้าทั้งหมด' },
    { to: '/products?sort=popular', label: 'ขายดี' },
    { to: '/products?sort=newest', label: 'ใหม่ล่าสุด' },
  ]

  const accountLinks = session
    ? [
        { to: '/wallet', label: 'กระเป๋าเงิน' },
        { to: '/wallet/topup', label: 'เติมเงิน' },
        { to: '/orders', label: 'ประวัติคำสั่งซื้อ' },
        { to: '/wishlist', label: 'รายการแจ้งเตือน' },
        { to: '/profile', label: 'โปรไฟล์' },
      ]
    : [
        { to: '/login', label: 'เข้าสู่ระบบ' },
        { to: '/register', label: 'สมัครสมาชิก' },
      ]

  const helpLinks = [
    { to: '/faq', label: 'คำถามที่พบบ่อย' },
    { to: '/terms', label: 'เงื่อนไขการให้บริการ' },
    { to: '/privacy', label: 'นโยบายความเป็นส่วนตัว' },
  ]

  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <Logo size="lg" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              ร้านขายไอดีและไอเทมเกม ส่งของผ่านอีเมลอัตโนมัติ ทันทีที่ชำระเงิน
              ด้วย QR PromptPay
            </p>

            {links && links.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  ติดต่อ
                </p>
                <ul className="mt-2 flex flex-wrap items-center gap-2">
                  {links.map((l) => (
                    <li key={l.id}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={l.label}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background transition-colors hover:bg-accent"
                      >
                        <PlatformIcon
                          platform={l.platform}
                          className={cn(
                            'h-4 w-4',
                            platformBrandColor[l.platform],
                          )}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Link columns */}
          <FooterCol
            title="สินค้า"
            items={productLinks}
            className="md:col-span-2"
          />
          <FooterCol
            title="บัญชี"
            items={accountLinks}
            className="md:col-span-2"
          />
          <FooterCol
            title="ช่วยเหลือ"
            items={helpLinks}
            className="md:col-span-3"
          />
        </div>

        <div className="mt-12 flex flex-col items-start gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CubbyStore — ทุกสิทธิ์สงวน</p>
          <p className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            ระบบส่งของออนไลน์ตลอด 24 ชั่วโมง
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  items,
  className,
}: {
  title: string
  items: { to: string; label: string }[]
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.to}>
            <Link
              to={it.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
