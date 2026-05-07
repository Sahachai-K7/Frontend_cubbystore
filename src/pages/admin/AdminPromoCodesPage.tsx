import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from '@/components/ui/responsive-table'
import {
  useAdminPromos,
  useCreatePromo,
  useDeletePromo,
  useUpdatePromo,
} from '@/features/admin/promo.api'
import { formatPriceTHB } from '@/lib/utils'
import type { PromoCode } from '@/lib/types'

const Schema = z.object({
  code: z.string().min(2, 'อย่างน้อย 2 ตัว').max(40),
  type: z.enum(['percent', 'amount']),
  value: z.number().min(0.01).max(1_000_000),
  minTotal: z.number().min(0).optional(),
  maxUses: z.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
  note: z.string().max(200).optional(),
})
type FormValues = z.infer<typeof Schema>

export function AdminPromoCodesPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const { data, isPending } = useAdminPromos(filter)
  const createMut = useCreatePromo()
  const updateMut = useUpdatePromo()
  const deleteMut = useDeletePromo()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { type: 'percent', value: 10 },
  })
  const type = watch('type')

  const onCreate = async (v: FormValues) => {
    try {
      await createMut.mutateAsync({
        code: v.code,
        type: v.type,
        value: v.value,
        minTotal: v.minTotal ?? null,
        maxUses: v.maxUses ?? null,
        expiresAt: v.expiresAt ? new Date(v.expiresAt).toISOString() : null,
        note: v.note ?? null,
        isActive: true,
      })
      toast.success('สร้าง promo code แล้ว')
      reset({ code: '', type: 'percent', value: 10 })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'สร้างไม่สำเร็จ')
    }
  }

  const columns: ResponsiveTableColumn<PromoCode>[] = [
    {
      key: 'code',
      label: 'Code',
      render: (p) => (
        <span className="font-mono text-sm font-semibold">{p.code}</span>
      ),
    },
    {
      key: 'discount',
      label: 'ส่วนลด',
      render: (p) =>
        p.type === 'percent' ? (
          <span>{p.value}%</span>
        ) : (
          <span>{formatPriceTHB(p.value)}</span>
        ),
    },
    {
      key: 'minTotal',
      label: 'ขั้นต่ำ',
      render: (p) =>
        p.minTotal ? (
          <span className="text-muted-foreground">
            ≥ {formatPriceTHB(p.minTotal)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'usage',
      label: 'ใช้แล้ว',
      align: 'right',
      render: (p) => (
        <span className="tabular-nums">
          {p.usedCount}
          {p.maxUses ? ` / ${p.maxUses}` : ''}
        </span>
      ),
    },
    {
      key: 'expires',
      label: 'หมดอายุ',
      render: (p) =>
        p.expiresAt ? (
          <span className="text-xs text-muted-foreground">
            {new Date(p.expiresAt).toLocaleDateString('th-TH')}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">ไม่มี</span>
        ),
    },
    {
      key: 'status',
      label: 'สถานะ',
      render: (p) =>
        p.isActive ? (
          <Badge variant="secondary">เปิด</Badge>
        ) : (
          <Badge variant="outline">ปิด</Badge>
        ),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      align: 'right',
      render: (p) => (
        <div
          className="flex justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault()
              updateMut.mutate({ id: p.id, isActive: !p.isActive })
            }}
            disabled={updateMut.isPending}
          >
            {p.isActive ? 'ปิด' : 'เปิด'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={async (e) => {
              e.preventDefault()
              if (!confirm(`ลบ ${p.code}?`)) return
              try {
                await deleteMut.mutateAsync(p.id)
                toast.success('ลบแล้ว')
              } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
              }
            }}
            aria-label="ลบ"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Promo codes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          สร้างโค้ดส่วนลด ลูกค้าใส่ตอน checkout
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">สร้างโค้ดใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onCreate)}
            className="grid gap-3 md:grid-cols-[160px_140px_1fr_140px_auto]"
          >
            <div>
              <Label htmlFor="code" className="text-xs">โค้ด</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="WELCOME10"
                className="font-mono uppercase"
              />
              {errors.code && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="type" className="text-xs">ประเภท</Label>
              <Select id="type" {...register('type')}>
                <option value="percent">เปอร์เซ็นต์</option>
                <option value="amount">จำนวนบาท</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="value" className="text-xs">
                ค่า {type === 'percent' ? '(%)' : '(฿)'}
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                {...register('value', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="minTotal" className="text-xs">ขั้นต่ำ (฿) optional</Label>
              <Input
                id="minTotal"
                type="number"
                step="0.01"
                {...register('minTotal', { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={createMut.isPending}>
                <Plus className="mr-1 h-4 w-4" /> สร้าง
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 p-4">
            <Select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as 'all' | 'active' | 'inactive')
              }
              className="w-44"
            >
              <option value="active">เปิดใช้งาน</option>
              <option value="inactive">ปิดอยู่</option>
              <option value="all">ทั้งหมด</option>
            </Select>
            <span className="ml-auto text-sm text-muted-foreground">
              {data ? `${data.length} รายการ` : '…'}
            </span>
          </div>
          <ResponsiveTable
            data={data}
            columns={columns}
            rowKey={(p) => p.id}
            loading={isPending}
            emptyMessage="ยังไม่มี promo code"
          />
        </CardContent>
      </Card>
    </div>
  )
}
