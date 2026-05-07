import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
  Tag,
  Wallet,
  Zap,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import { usePublicProducts } from '@/features/catalog/public.api'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

export function HomePage() {
  const { data, isPending } = usePublicProducts({ sort: 'popular', limit: 8 })
  const { data: session } = useSession()

  return (
    <>
      <Hero session={!!session} />
      <TrustPillars />
      <FeaturedProducts data={data} isPending={isPending} />
      <HowItWorks />
      <CtaFooter session={!!session} />
    </>
  )
}

function SquigglyUnderline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 7 Q40 1 80 5 T160 4 T198 6"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Hero({ session }: { session: boolean }) {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Faint dot-grid background — Vercel/Linear style */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, color-mix(in oklab, currentColor 12%, transparent) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-6xl flex-col justify-center px-4 py-8 md:block md:min-h-0 md:py-20">
        <div className="grid gap-8 md:grid-cols-12 md:gap-8 lg:gap-12">
        {/* Left on desktop, second on mobile: copy */}
        <div className="order-2 md:order-1 md:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-background px-2.5 py-1 font-pixel text-[8px] uppercase leading-none tracking-[0.12em] shadow-pixel-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span>NEXT LEVEL · GAME GOODS</span>
          </span>

          <h1 className="mt-5 text-balance text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-6xl md:leading-[1.05]">
            <span className="block">ของแท้คัดมา</span>
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                ส่งทันที
              </span>
              <SquigglyUnderline className="absolute -bottom-1.5 left-0 h-2 w-full text-violet-500/70 md:-bottom-3 md:h-3" />
            </span>{' '}
            <span>ตลอด 24 ชม.</span>
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base md:mt-6 md:text-lg">
            ไอดีและไอเทมเกมคัดสรรเอง เช็คใช้งานได้ก่อนวางขายทุกชิ้น
            ระบบส่งของทางอีเมลทันทีที่ชำระเงิน พร้อมประวัติย้อนหลังตามได้ตลอด
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/products"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'group w-full sm:w-auto',
              )}
            >
              เริ่มเลือกสินค้า
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {session ? (
              <Link
                to="/wallet"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'w-full sm:w-auto',
                )}
              >
                <Wallet className="mr-1 h-4 w-4" /> เปิดกระเป๋า
              </Link>
            ) : (
              <Link
                to="/register"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'w-full sm:w-auto',
                )}
              >
                สมัครสมาชิก
              </Link>
            )}
          </div>

          <ul className="mt-8 grid grid-cols-3 gap-x-3 gap-y-2 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:gap-x-5 sm:text-sm">
            <li className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0 text-foreground" />
              <span>ส่งในวินาที</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 shrink-0 text-foreground" />
              <span>PromptPay</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 shrink-0 text-foreground" />
              <span>มีประวัติ</span>
            </li>
          </ul>
        </div>

        {/* Right on desktop, first on mobile: delivered email mockup */}
        <div className="relative order-1 md:order-2 md:col-span-5">
          <DeliveredEmailMock />
        </div>
        </div>
      </div>
    </section>
  )
}

function DeliveredEmailMock() {
  return (
    <div className="relative">
      {/* Soft glow behind card — single accent color, low opacity */}
      <div
        aria-hidden="true"
        className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-violet-500/10 via-fuchsia-400/5 to-transparent blur-2xl"
      />

      <article className="rounded-md border-2 border-foreground bg-card p-5 shadow-pixel">
        <header className="flex items-start gap-3 border-b pb-3">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-pink-500 text-xs font-bold text-white"
          >
            C
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">CubbyStore</p>
            <p className="truncate text-xs text-muted-foreground">
              noreply@k4ecubby.dev · ตอนนี้
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> ส่งแล้ว
          </span>
        </header>

        <div className="mt-4">
          <p className="text-sm font-semibold tracking-tight">
            🎮 คำสั่งซื้อ ab8a3931 จัดส่งแล้ว
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            1 รายการ · ยอดรวม ฿299.00
          </p>
        </div>

        <div className="mt-3 rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium">ID ROV ระดับ Master</p>
          <pre className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-muted-foreground">
            rov_master_001@example.com{'\n'}
            R•••••••••#01
          </pre>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          เก็บอีเมลฉบับนี้ไว้เป็นหลักฐาน · ดูประวัติได้ที่หน้า "คำสั่งซื้อ"
        </p>
      </article>

      {/* Tilted timing pill — pixel-stamped sticker feel */}
      <div className="absolute -bottom-3 left-4 hidden rotate-[-2deg] items-center gap-1.5 rounded-none border-2 border-foreground bg-background px-2.5 py-1 font-pixel text-[9px] uppercase leading-none shadow-pixel-sm sm:inline-flex">
        <Clock className="h-3 w-3 text-emerald-600" />
        47s
      </div>
    </div>
  )
}

function TrustPillars() {
  const pillars = [
    {
      icon: Zap,
      title: 'ส่งทันที 24/7',
      desc: 'ระบบส่งของให้ทางอีเมลภายในไม่กี่วินาที ไม่ต้องรอเปิดร้าน ไม่ต้องแชทรอตอบ',
    },
    {
      icon: Tag,
      title: 'ราคาเป็นมิตร',
      desc: 'ตั้งราคาตรงไปตรงมา ไม่มีค่าธรรมเนียมแอบแฝง เห็นยอดสุดท้ายชัดเจน',
    },
    {
      icon: ShieldCheck,
      title: 'ปลอดภัย ตามได้',
      desc: 'ทุกออเดอร์มีประวัติ ดูซ้ำหรือขอ resend ได้ทุกเวลา ติดต่อแอดมินตรง',
    },
  ]

  return (
    <section className="border-b bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid gap-3 md:grid-cols-3 md:gap-6">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-md border bg-background p-4 md:gap-4 md:rounded-md md:border-2 md:border-foreground md:p-5 md:shadow-pixel-sm"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-foreground text-background md:h-11 md:w-11">
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold tracking-tight md:text-lg">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'เติมเข้ากระเป๋า',
      desc: 'สแกน QR PromptPay ตามยอดที่ระบบสุ่มให้ เครดิตเข้าทันทีที่ธนาคารแจ้งเตือน',
    },
    {
      n: '02',
      title: 'เลือกสินค้า + checkout',
      desc: 'หยิบใส่ตะกร้า กดยืนยัน หักจากกระเป๋า ไม่ต้องโอนซ้ำ',
    },
    {
      n: '03',
      title: 'รับของทาง email',
      desc: 'ระบบดึงไอดีจากคลังส่งให้ภายในวินาที ดูซ้ำได้จากหน้าประวัติ',
    },
  ]

  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-10 max-w-xl">
          <p className="font-pixel text-[10px] uppercase leading-none tracking-[0.15em] text-muted-foreground">
            ขั้นตอน
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            สามขั้นตอน ใช้งานง่าย
          </h2>
        </div>
        <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((s, i) => (
            <li key={s.n} className="relative">
              <div className="flex items-end gap-3">
                <span className="font-pixel-display text-3xl leading-none text-muted-foreground/80">
                  {s.n}
                </span>
                <span aria-hidden="true" className="mb-2 h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
              {i < steps.length - 1 && (
                <ArrowRight
                  aria-hidden="true"
                  className="absolute -right-3 top-2 hidden h-3 w-3 text-muted-foreground/40 md:block"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function FeaturedProducts({
  data,
  isPending,
}: {
  data: ReturnType<typeof usePublicProducts>['data']
  isPending: boolean
}) {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-pixel text-[10px] uppercase leading-none tracking-[0.15em] text-muted-foreground">
              ขายดี
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              สินค้าแนะนำ
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {isPending &&
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          {data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
          {data && data.items.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
              ยังไม่มีสินค้า — เพิ่มสินค้าจากหน้า Admin
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function CtaFooter({ session }: { session: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="rounded-2xl border bg-card px-6 py-12 text-center md:px-12 md:py-16">
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          {session ? 'อยากซื้ออะไรวันนี้?' : 'พร้อมเริ่มใช้งานหรือยัง?'}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
          {session
            ? 'เลือกสินค้าใส่ตะกร้า ของจะถูกส่งให้อัตโนมัติทันทีที่ชำระเงิน'
            : 'สมัครฟรี เติมเงินตามต้องการ ไม่มีรายเดือน ของส่งอัตโนมัติทันทีที่จ่าย'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/products" className={cn(buttonVariants({ size: 'lg' }))}>
            เลือกสินค้า
          </Link>
          {session ? (
            <Link
              to="/wallet/topup"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              <Wallet className="mr-1 h-4 w-4" /> เติมเงิน
            </Link>
          ) : (
            <Link
              to="/register"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              สมัครสมาชิก
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
