import { useState } from 'react'
import { ChevronDown, ChevronRight, RotateCw, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuditLog } from '@/features/admin/audit.api'
import { cn } from '@/lib/utils'
import type { AuditLogRow } from '@/lib/types'

function toIso(dt: string): string | undefined {
  if (!dt) return undefined
  const d = new Date(dt)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

export function AdminAuditLogPage() {
  const [actionInput, setActionInput] = useState('')
  const [appliedAction, setAppliedAction] = useState('')
  const [target, setTarget] = useState('')
  const [appliedTarget, setAppliedTarget] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data, isPending, isFetching, refetch } = useAuditLog({
    action: appliedAction || undefined,
    target: appliedTarget || undefined,
    from: toIso(from),
    to: toIso(to),
    page,
    limit: 50,
  })
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setAppliedAction(actionInput.trim())
    setAppliedTarget(target.trim())
    setPage(1)
  }

  const hasFilters = !!(appliedAction || appliedTarget || from || to)
  const clearAll = () => {
    setActionInput('')
    setAppliedAction('')
    setTarget('')
    setAppliedTarget('')
    setFrom('')
    setTo('')
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ทุก mutation ของแอดมิน — สร้าง/แก้/ลบสินค้า, ปรับ wallet, rotate API key, ฯลฯ
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <form onSubmit={onSearch} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="action prefix เช่น product., user., webhook_config."
                className="pl-8"
              />
            </div>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="target id (uuid)"
              className="font-mono text-xs"
            />
            <Button type="submit" variant="outline" size="sm">
              ค้นหา
            </Button>
          </form>

          <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label className="text-xs">จาก</Label>
              <Input
                type="datetime-local"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div>
              <Label className="text-xs">ถึง</Label>
              <Input
                type="datetime-local"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                <RotateCw className={cn('mr-1 h-4 w-4', isFetching && 'animate-spin')} />
                รีเฟรช
              </Button>
              {hasFilters && (
                <Button size="sm" variant="ghost" onClick={clearAll}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {data ? `${data.total} events` : '…'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isPending && (
            <p className="px-4 pb-4 pt-4 text-sm text-muted-foreground">กำลังโหลด…</p>
          )}
          {data && data.items.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">ไม่พบ event</p>
          )}
          {data && data.items.length > 0 && (
            <div className="divide-y">
              {data.items.map((ev) => (
                <Row
                  key={ev.id}
                  ev={ev}
                  expanded={expanded === ev.id}
                  onToggle={() =>
                    setExpanded(expanded === ev.id ? null : ev.id)
                  }
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

function Row({
  ev,
  expanded,
  onToggle,
}: {
  ev: AuditLogRow
  expanded: boolean
  onToggle: () => void
}) {
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
            <Badge variant="secondary" className="font-mono text-[10px]">
              {ev.action}
            </Badge>
            <span className="text-xs text-muted-foreground">
              by {ev.adminName ?? ev.adminEmail ?? ev.adminId.slice(0, 8)}
            </span>
            <span className="text-xs text-muted-foreground">
              · {new Date(ev.createdAt).toLocaleString('th-TH')}
            </span>
            {ev.ip && (
              <span className="font-mono text-xs text-muted-foreground">
                {ev.ip}
              </span>
            )}
          </div>
          {ev.target && (
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
              target: {ev.target}
            </p>
          )}
        </div>
      </button>
      {expanded && (
        <pre className="ml-7 mt-2 overflow-x-auto rounded-md border bg-muted/30 p-2 font-mono text-xs">
          {JSON.stringify(ev.payload ?? null, null, 2)}
        </pre>
      )}
    </div>
  )
}
