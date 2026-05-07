import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from '@/components/ui/responsive-table'
import { useAdminOrders } from '@/features/orders/orders.api'
import { formatPriceTHB } from '@/lib/utils'
import type { AdminOrderRow } from '@/lib/types'

const statusMeta = {
  paid: { label: 'จ่ายแล้ว / รอส่ง', variant: 'outline' as const },
  delivered: { label: 'ส่งแล้ว', variant: 'secondary' as const },
  delivery_failed: { label: 'ส่งล้มเหลว', variant: 'destructive' as const },
  refunded: { label: 'คืนเงินแล้ว', variant: 'destructive' as const },
}

function toIso(dt: string): string | undefined {
  if (!dt) return undefined
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AdminOrdersPage() {
  const [status, setStatus] = useState<'' | keyof typeof statusMeta>('')
  const [searchInput, setSearchInput] = useState('')
  const [appliedQ, setAppliedQ] = useState('')
  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')
  const [page, setPage] = useState(1)

  const { data, isPending } = useAdminOrders({
    status: status || undefined,
    q: appliedQ || undefined,
    from: toIso(fromInput),
    to: toIso(toInput),
    page,
    limit: 30,
  })
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  const setPreset = (kind: 'today' | '7d' | '30d' | 'clear') => {
    const now = new Date()
    if (kind === 'clear') {
      setFromInput('')
      setToInput('')
    } else {
      const from = new Date(now)
      if (kind === 'today') from.setHours(0, 0, 0, 0)
      if (kind === '7d') from.setDate(from.getDate() - 7)
      if (kind === '30d') from.setDate(from.getDate() - 30)
      setFromInput(toLocalInput(from))
      setToInput(toLocalInput(now))
    }
    setPage(1)
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setAppliedQ(searchInput.trim())
    setPage(1)
  }

  const hasFilters = !!(status || fromInput || toInput || appliedQ)
  const clearAll = () => {
    setStatus('')
    setSearchInput('')
    setAppliedQ('')
    setFromInput('')
    setToInput('')
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">คำสั่งซื้อ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ค้นด้วยอีเมล / ชื่อ / เลขออเดอร์ — กดเข้าออเดอร์เพื่อ resend อีเมลถ้าส่งไม่ถึง
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <form onSubmit={onSearch} className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ค้น email / ชื่อลูกค้า / 8 ตัวแรกของ order id"
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="outline" size="sm">
                ค้นหา
              </Button>
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as '' | keyof typeof statusMeta)
                  setPage(1)
                }}
                className="md:w-44"
              >
                <option value="">สถานะทั้งหมด</option>
                {(Object.keys(statusMeta) as Array<keyof typeof statusMeta>).map(
                  (s) => (
                    <option key={s} value={s}>
                      {statusMeta[s].label}
                    </option>
                  ),
                )}
              </Select>
            </div>
          </form>

          <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label className="text-xs" htmlFor="from">จาก</Label>
              <Input
                id="from"
                type="datetime-local"
                value={fromInput}
                onChange={(e) => {
                  setFromInput(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div>
              <Label className="text-xs" htmlFor="to">ถึง</Label>
              <Input
                id="to"
                type="datetime-local"
                value={toInput}
                onChange={(e) => {
                  setToInput(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="flex flex-wrap items-end gap-1">
              <Button size="sm" variant="ghost" onClick={() => setPreset('today')}>
                วันนี้
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPreset('7d')}>
                7 วัน
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPreset('30d')}>
                30 วัน
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPreset('clear')}>
                ล้างวันที่
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {data ? `${data.total} รายการ` : '…'}
            </span>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <X className="mr-1 h-4 w-4" /> ล้างทั้งหมด
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ResponsiveTable
            data={data?.items}
            columns={
              [
                {
                  key: 'id',
                  label: 'หมายเลข',
                  render: (o) => (
                    <span className="font-mono text-xs">{o.id.slice(0, 8)}</span>
                  ),
                },
                {
                  key: 'createdAt',
                  label: 'วันที่',
                  render: (o) => (
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString('th-TH')}
                    </span>
                  ),
                },
                {
                  key: 'customer',
                  label: 'ลูกค้า',
                  render: (o) => (
                    <span className="block">
                      <span className="block">{o.userName ?? '—'}</span>
                      {o.userEmail && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSearchInput(o.userEmail!)
                            setAppliedQ(o.userEmail!)
                            setPage(1)
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                          title="กรองเฉพาะลูกค้านี้"
                        >
                          {o.userEmail}
                        </button>
                      )}
                    </span>
                  ),
                },
                {
                  key: 'total',
                  label: 'ยอด',
                  align: 'right',
                  render: (o) => (
                    <span className="font-medium">{formatPriceTHB(o.total)}</span>
                  ),
                },
                {
                  key: 'status',
                  label: 'สถานะ',
                  render: (o) => (
                    <Badge variant={statusMeta[o.status].variant}>
                      {statusMeta[o.status].label}
                    </Badge>
                  ),
                },
              ] satisfies ResponsiveTableColumn<AdminOrderRow>[]
            }
            rowKey={(o) => o.id}
            rowHref={(o) => `/admin/orders/${o.id}`}
            loading={isPending}
            emptyMessage="ไม่พบคำสั่งซื้อตามเงื่อนไข"
          />
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ← ก่อนหน้า
          </Button>
          <span className="text-sm text-muted-foreground">
            หน้า {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            ถัดไป →
          </Button>
        </div>
      )}
    </div>
  )
}
