import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ClipboardCopy, CheckCircle2, Clock, RotateCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreateTopup, useTopupStatus } from '@/features/wallet/wallet.api'
import { ApiError } from '@/lib/api'
import { formatPriceTHB } from '@/lib/utils'
import type { TopupCreated } from '@/lib/types'

const Schema = z.object({
  amount: z.number().int().min(20, 'ขั้นต่ำ 20 บาท').max(50000, 'ครั้งละไม่เกิน 50,000 บาท'),
})
type FormValues = z.infer<typeof Schema>

const QUICK = [50, 100, 200, 500, 1000]

export function TopupPage() {
  const [created, setCreated] = useState<TopupCreated | null>(null)
  const createMut = useCreateTopup()

  const onCreated = (item: TopupCreated) => setCreated(item)
  const onReset = () => setCreated(null)

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <Link
        to="/wallet"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> กลับกระเป๋า
      </Link>

      {!created ? (
        <TopupForm submitting={createMut.isPending} onSubmit={async (amount) => {
          try {
            const res = await createMut.mutateAsync(amount)
            onCreated(res)
          } catch (e: unknown) {
            const code = e instanceof ApiError ? String(e.body && typeof e.body === 'object' && 'error' in e.body ? (e.body as { error: unknown }).error : e.message) : (e instanceof Error ? e.message : 'create_failed')
            const map: Record<string, string> = {
              no_payment_config: 'แอดมินยังไม่ได้ตั้งค่า PromptPay',
              no_webhook_config: 'แอดมินยังไม่ได้ตั้งค่า webhook',
              no_slot_available: 'มี top-up รอจ่ายมากเกินไป กรุณารอให้รายการอื่นหมดอายุ',
              invalid_amount: 'จำนวนเงินไม่ถูกต้อง',
              email_not_verified:
                'กรุณายืนยันอีเมลของคุณก่อน — ตรวจกล่องขาเข้าหรือกดส่งใหม่ในแบนเนอร์ด้านบน',
            }
            toast.error(map[code] ?? `สร้างรายการเติมไม่สำเร็จ: ${code}`)
          }
        }} />
      ) : (
        <PaymentPanel created={created} onAgain={onReset} />
      )}
    </section>
  )
}

function TopupForm({
  submitting,
  onSubmit,
}: {
  submitting: boolean
  onSubmit: (amount: number) => void
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { amount: 100 },
  })
  const current = watch('amount')

  return (
    <Card>
      <CardHeader>
        <CardTitle>เติมเงินเข้ากระเป๋า</CardTitle>
        <CardDescription>
          ระบบจะสร้างยอดที่ต้องโอนแบบไม่ซ้ำกับใคร โอนตามยอดที่เห็นเท่านั้น
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((v) => onSubmit(v.amount))}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
            <Input
              id="amount"
              type="number"
              min={20}
              step={1}
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK.map((v) => (
                <Button
                  key={v}
                  type="button"
                  size="sm"
                  variant={current === v ? 'default' : 'outline'}
                  onClick={() => setValue('amount', v, { shouldValidate: true })}
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'กำลังสร้างรายการ…' : 'ดำเนินการต่อ →'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PaymentPanel({
  created,
  onAgain,
}: {
  created: TopupCreated
  onAgain: () => void
}) {
  const navigate = useNavigate()
  const status = useTopupStatus(created.id)
  const expiresAt = new Date(created.expiresAt).getTime()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  const live = status.data
  const liveStatus = live?.status ?? 'pending'

  const onCopyAmount = async () => {
    try {
      await navigator.clipboard.writeText(created.amountToPay)
      toast.success('คัดลอกยอดแล้ว')
    } catch {
      toast.error('คัดลอกไม่สำเร็จ')
    }
  }

  if (liveStatus === 'confirmed') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <CheckCircle2 className="h-14 w-14 text-green-600" />
          <h2 className="text-xl font-semibold">เติมเงินสำเร็จ!</h2>
          <p className="text-sm text-muted-foreground">
            เครดิต {formatPriceTHB(created.amountBase)} เข้ากระเป๋าแล้ว
          </p>
          <div className="mt-2 flex gap-2">
            <Button onClick={() => navigate('/wallet')}>ไปกระเป๋า</Button>
            <Button variant="outline" onClick={onAgain}>เติมอีกครั้ง</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (liveStatus === 'expired' || (remaining === 0 && liveStatus === 'pending')) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <Clock className="h-14 w-14 text-muted-foreground" />
          <h2 className="text-xl font-semibold">หมดเวลาแล้ว</h2>
          <p className="text-sm text-muted-foreground">
            รายการเติมเงินนี้หมดอายุ — กรุณาเริ่มใหม่
          </p>
          <Button onClick={onAgain}>
            <RotateCw className="mr-1 h-4 w-4" /> เริ่มใหม่
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>สแกน QR เพื่อชำระเงิน</CardTitle>
        <CardDescription>
          โอนตามยอดที่ระบุเท่านั้น ระบบจะเครดิต{' '}
          <strong>{formatPriceTHB(created.amountBase)}</strong> เข้ากระเป๋าทันที
        </CardDescription>
      </CardHeader>
      <CardContent className="grid place-items-center gap-6 text-center md:grid-cols-[auto_1fr] md:place-items-start md:text-left">
        <div className="rounded-lg border bg-white p-2">
          <img src={created.qrDataUrl} alt="PromptPay QR" className="block h-56 w-56" />
        </div>
        <div className="flex w-full flex-col items-center gap-3 md:items-stretch">
          <div className="w-full rounded-lg border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              ยอดที่ต้องโอน (ตรงเป๊ะ)
            </p>
            <div className="mt-1 flex items-center justify-center gap-2 md:justify-start">
              <p className="text-3xl font-semibold tracking-tight">
                {formatPriceTHB(created.amountToPay)}
              </p>
              <Button size="sm" variant="ghost" onClick={onCopyAmount} aria-label="คัดลอก">
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              เครดิตเข้ากระเป๋าจะเป็น {formatPriceTHB(created.amountBase)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              เหลือเวลา {mm}:{ss}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <RotateCw className={`h-3 w-3 ${status.isFetching ? 'animate-spin' : ''}`} />
              ตรวจสถานะอัตโนมัติทุก 3 วิ
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            เปิดแอปธนาคาร / e-wallet → สแกน QR → ตรวจสอบยอด → โอน
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
