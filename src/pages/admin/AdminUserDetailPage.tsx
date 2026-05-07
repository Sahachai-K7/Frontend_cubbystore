import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ChevronLeft,
  Minus,
  Plus,
  Shield,
  ShieldOff,
  Wallet,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  useAdjustWallet,
  useAdminUser,
  useChangeUserRole,
} from '@/features/admin/users.api'
import { useSession } from '@/lib/auth-client'
import { ApiError } from '@/lib/api'
import { formatPriceTHB } from '@/lib/utils'

const AdjustSchema = z.object({
  amount: z.number().refine((n) => n !== 0, 'จำนวนต้องไม่ใช่ 0'),
  note: z.string().max(200).optional(),
})
type AdjustForm = z.infer<typeof AdjustSchema>

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const me = session?.user as { id?: string } | undefined
  const { data, isPending, error } = useAdminUser(id)

  if (isPending) return <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
  if (error || !data) {
    return (
      <div>
        <p className="text-sm text-destructive">ไม่พบผู้ใช้</p>
        <Link to="/admin/users" className="text-sm text-primary hover:underline">
          ← กลับ
        </Link>
      </div>
    )
  }

  const u = data.user
  const isSelf = me?.id === u.id

  return (
    <div className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> ผู้ใช้ทั้งหมด
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">{u.name ?? u.email}</CardTitle>
              <p className="font-mono text-xs text-muted-foreground">{u.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {u.role === 'admin' ? (
                  <Badge className="gap-1">
                    <Shield className="h-3 w-3" /> Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
                <Badge variant="outline">
                  {u.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
                </Badge>
                <span className="text-muted-foreground">
                  สมัคร {new Date(u.createdAt).toLocaleString('th-TH')}
                </span>
              </div>
            </div>
            <RoleToggle
              userId={u.id}
              currentRole={u.role}
              disabled={isSelf}
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="ออเดอร์" value={String(data.stats.orderCount)} />
        <Stat
          label="ยอดใช้จ่ายรวม"
          value={formatPriceTHB(data.stats.totalSpent)}
        />
        <Stat
          label="ยอดในกระเป๋า"
          value={formatPriceTHB(data.stats.walletBalance)}
        />
      </div>

      <WalletAdjustCard userId={u.id} balance={data.stats.walletBalance} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ออเดอร์ล่าสุด</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.orders.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              — ยังไม่มีออเดอร์ —
            </p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="px-4 py-2">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="font-mono text-xs hover:underline"
                      >
                        {o.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatPriceTHB(o.total)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={
                          o.status === 'delivered'
                            ? 'secondary'
                            : o.status === 'delivery_failed'
                              ? 'destructive'
                              : 'outline'
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ประวัติกระเป๋า</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.walletTransactions.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">— ยังไม่มี —</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {data.walletTransactions.map((t) => {
                  const positive = Number(t.amount) >= 0
                  return (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(t.createdAt).toLocaleString('th-TH')}
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant="outline">{t.type}</Badge>
                        {t.note && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {t.note}
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-4 py-2 text-right font-medium ${positive ? 'text-green-600' : 'text-destructive'}`}
                      >
                        {positive ? '+' : ''}
                        {formatPriceTHB(t.amount)}
                      </td>
                      <td className="px-4 py-2 text-right text-muted-foreground">
                        {formatPriceTHB(t.balanceAfter)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sessions ที่ active</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.sessions.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">— ไม่มี —</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {data.sessions.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-mono text-xs">
                      {s.ipAddress ?? '—'}
                    </td>
                    <td className="px-4 py-2 truncate text-xs text-muted-foreground">
                      {s.userAgent ?? '—'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleString('th-TH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}

function RoleToggle({
  userId,
  currentRole,
  disabled,
}: {
  userId: string
  currentRole: 'user' | 'admin'
  disabled?: boolean
}) {
  const mut = useChangeUserRole()
  const target: 'user' | 'admin' = currentRole === 'admin' ? 'user' : 'admin'
  const onClick = async () => {
    if (
      !confirm(
        target === 'admin'
          ? 'เลื่อนเป็น Admin? จะมีสิทธิ์เข้าหน้า admin ทั้งหมด'
          : 'ลด Admin เป็น User?',
      )
    )
      return
    try {
      await mut.mutateAsync({ id: userId, role: target })
      toast.success(target === 'admin' ? 'ตั้งเป็น Admin แล้ว' : 'เปลี่ยนเป็น User แล้ว')
    } catch (err: unknown) {
      const code = err instanceof ApiError && (err.body as { error?: string })?.error
      toast.error(
        code === 'cannot_demote_self'
          ? 'ไม่สามารถลด admin ของตัวเองได้'
          : err instanceof Error
            ? err.message
            : 'ไม่สำเร็จ',
      )
    }
  }
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      disabled={disabled || mut.isPending}
      title={disabled ? 'ไม่สามารถลด role ของตัวเอง' : undefined}
    >
      {target === 'admin' ? (
        <>
          <Shield className="mr-1 h-4 w-4" /> เลื่อนเป็น Admin
        </>
      ) : (
        <>
          <ShieldOff className="mr-1 h-4 w-4" /> ลดเป็น User
        </>
      )}
    </Button>
  )
}

function WalletAdjustCard({
  userId,
  balance,
}: {
  userId: string
  balance: string
}) {
  const [showForm, setShowForm] = useState(false)
  const [direction, setDirection] = useState<'+' | '-'>('+')
  const adjustMut = useAdjustWallet()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustForm>({
    resolver: zodResolver(AdjustSchema),
    defaultValues: { amount: 0, note: '' },
  })

  const onSubmit = async (v: AdjustForm) => {
    const signed = direction === '+' ? Math.abs(v.amount) : -Math.abs(v.amount)
    try {
      await adjustMut.mutateAsync({
        id: userId,
        amount: signed,
        note: v.note?.trim() || undefined,
      })
      toast.success(
        `${direction === '+' ? 'เติม' : 'หัก'}กระเป๋าแล้ว ${formatPriceTHB(Math.abs(signed))}`,
      )
      reset({ amount: 0, note: '' })
      setShowForm(false)
    } catch (err: unknown) {
      const code = err instanceof ApiError && (err.body as { error?: string })?.error
      toast.error(
        code === 'would_be_negative'
          ? 'หักแล้วยอดติดลบ — ไม่อนุญาต'
          : err instanceof Error
            ? err.message
            : 'ไม่สำเร็จ',
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            ปรับยอดกระเป๋า
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            ปัจจุบัน {formatPriceTHB(balance)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            ปรับยอด
          </Button>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={direction === '+' ? 'default' : 'outline'}
                onClick={() => setDirection('+')}
              >
                <Plus className="mr-1 h-4 w-4" /> เพิ่ม
              </Button>
              <Button
                type="button"
                size="sm"
                variant={direction === '-' ? 'destructive' : 'outline'}
                onClick={() => setDirection('-')}
              >
                <Minus className="mr-1 h-4 w-4" /> หัก
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="amount" className="text-xs">
                  จำนวน (บาท)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={0}
                  {...register('amount', { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.amount.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="note" className="text-xs">
                  หมายเหตุ (เก็บใน audit log)
                </Label>
                <Input
                  id="note"
                  {...register('note')}
                  placeholder="เช่น ชดเชย order #abc"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={adjustMut.isPending}>
                {adjustMut.isPending ? 'กำลังบันทึก…' : 'ยืนยัน'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false)
                  reset({ amount: 0, note: '' })
                }}
              >
                ยกเลิก
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
