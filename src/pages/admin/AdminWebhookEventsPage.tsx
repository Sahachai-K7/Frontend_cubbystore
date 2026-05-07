import { useState } from 'react'
import { ChevronDown, ChevronRight, RotateCw, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWebhookEvents, type EventStatus } from '@/features/admin/events.api'
import { cn } from '@/lib/utils'
import type { WebhookEvent } from '@/lib/types'

const statusLabels: Record<
  EventStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  matched: { label: 'จับคู่สำเร็จ', variant: 'secondary' },
  unmatched: { label: 'ไม่พบ pending ที่ตรง', variant: 'outline' },
  rejected_filter: { label: 'ไม่ผ่าน filter', variant: 'outline' },
  rejected_invalid_key: { label: 'API key ผิด', variant: 'destructive' },
  invalid_payload: { label: 'parse ยอดไม่ได้', variant: 'destructive' },
}

// Convert browser <input type="datetime-local"> string to ISO with local timezone
function toIso(dt: string): string | undefined {
  if (!dt) return undefined
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

// Format Date → "YYYY-MM-DDTHH:mm" in local timezone for input value
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

export function AdminWebhookEventsPage() {
  const [status, setStatus] = useState<EventStatus | ''>('')
  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [appliedQ, setAppliedQ] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data, isPending, isFetching, refetch } = useWebhookEvents({
    status: status || undefined,
    from: toIso(fromInput),
    to: toIso(toInput),
    q: appliedQ || undefined,
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
    setFromInput('')
    setToInput('')
    setSearchInput('')
    setAppliedQ('')
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">บันทึก Webhook</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ทุกการ POST เข้า <code>/api/webhook/payment</code> จะถูกบันทึกที่นี่ (รวมที่ key ผิด)
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr_auto]">
            <div>
              <Label className="text-xs">สถานะ</Label>
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as EventStatus | '')
                  setPage(1)
                }}
              >
                <option value="">ทั้งหมด</option>
                {(Object.keys(statusLabels) as EventStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s].label}
                  </option>
                ))}
              </Select>
            </div>
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
            <div className="flex items-end">
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                <RotateCw className={cn('mr-1 h-4 w-4', isFetching && 'animate-spin')} />
                รีเฟรช
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">ช่วงด่วน:</span>
            <Button size="sm" variant="ghost" onClick={() => setPreset('today')}>
              วันนี้
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPreset('7d')}>
              7 วันล่าสุด
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPreset('30d')}>
              30 วัน
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPreset('clear')}>
              ล้างวันที่
            </Button>
            <span className="ml-auto text-sm text-muted-foreground">
              {data ? `${data.total} รายการ` : '…'}
            </span>
          </div>

          <form onSubmit={onSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ค้นหาในข้อความ raw body…"
                className="pl-8"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">
              ค้นหา
            </Button>
            {hasFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                <X className="mr-1 h-4 w-4" /> ล้างทั้งหมด
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isPending && (
            <p className="px-6 pb-6 pt-6 text-sm text-muted-foreground">กำลังโหลด…</p>
          )}
          {data && data.items.length === 0 && (
            <p className="px-6 pb-6 pt-6 text-sm text-muted-foreground">
              ไม่พบ event ในเงื่อนไขนี้
            </p>
          )}
          {data && data.items.length > 0 && (
            <div className="divide-y">
              {data.items.map((ev) => (
                <EventRow
                  key={ev.id}
                  event={ev}
                  expanded={expanded === ev.id}
                  onToggle={() => setExpanded(expanded === ev.id ? null : ev.id)}
                />
              ))}
            </div>
          )}
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

function EventRow({
  event,
  expanded,
  onToggle,
}: {
  event: WebhookEvent
  expanded: boolean
  onToggle: () => void
}) {
  const meta = statusLabels[event.status]
  return (
    <div className="px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 text-left"
      >
        {expanded ? (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant={meta.variant}>{meta.label}</Badge>
            {event.parsedAmount && (
              <span className="font-mono text-xs">฿ {event.parsedAmount}</span>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(event.receivedAt).toLocaleString('th-TH')}
            </span>
            {event.sourceIp && (
              <span className="font-mono text-xs text-muted-foreground">
                {event.sourceIp}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {event.rawBody.length > 100
              ? event.rawBody.slice(0, 100) + '…'
              : event.rawBody}
          </p>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 ml-7 space-y-3 text-sm">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Raw body
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-md border bg-muted/30 p-2 font-mono text-xs">
              {event.rawBody || '(empty)'}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Headers
            </p>
            <pre className="overflow-x-auto rounded-md border bg-muted/30 p-2 font-mono text-xs">
              {JSON.stringify(event.headers ?? {}, null, 2)}
            </pre>
          </div>
          {event.matchedTopupId && (
            <p className="text-xs">
              Matched topup:{' '}
              <code className="rounded bg-muted px-1 py-0.5 font-mono">
                {event.matchedTopupId}
              </code>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
