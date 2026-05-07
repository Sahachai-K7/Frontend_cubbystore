import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Mail, RotateCcw, RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  useAdminOrder,
  useRefundOrder,
  useResendDelivery,
} from '@/features/orders/orders.api'
import { formatPriceTHB } from '@/lib/utils'

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isPending, error } = useAdminOrder(id)
  const resendMut = useResendDelivery()

  if (isPending) return <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
  if (error || !data) {
    return (
      <div>
        <p className="text-sm text-destructive">ไม่พบคำสั่งซื้อ</p>
        <Link to="/admin/orders" className="text-sm text-primary hover:underline">
          ← กลับ
        </Link>
      </div>
    )
  }

  const { order, lines, customer } = data

  const onResend = async () => {
    if (!id) return
    if (!confirm('ส่ง email สินค้าให้ลูกค้าอีกครั้ง?')) return
    try {
      await resendMut.mutateAsync(id)
      toast.success('ส่ง email สำเร็จ')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ส่งไม่สำเร็จ')
    }
  }

  const statusBadge =
    order.status === 'delivered' ? (
      <Badge variant="secondary">ส่งแล้ว</Badge>
    ) : order.status === 'delivery_failed' ? (
      <Badge variant="destructive">ส่งล้มเหลว</Badge>
    ) : order.status === 'refunded' ? (
      <Badge variant="destructive">คืนเงินแล้ว</Badge>
    ) : (
      <Badge variant="outline">จ่ายแล้ว</Badge>
    )

  return (
    <div className="space-y-6">
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> รายการทั้งหมด
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="font-mono text-base">
                {order.id.slice(0, 8)}
              </CardTitle>
              <CardDescription>
                {new Date(order.createdAt).toLocaleString('th-TH')}
              </CardDescription>
            </div>
            <div className="text-right">
              {statusBadge}
              <p className="mt-1 text-lg font-semibold">{formatPriceTHB(order.total)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              ลูกค้า
            </p>
            <p className="mt-1">{customer?.name ?? '—'}</p>
            <p className="font-mono text-xs text-muted-foreground">{customer?.email}</p>
          </div>

          {order.deliveryError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-medium">Error:</p>
              <p>{order.deliveryError}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onResend}
              disabled={resendMut.isPending}
              variant={order.status === 'delivery_failed' ? 'default' : 'outline'}
            >
              {order.status === 'delivery_failed' ? (
                <RotateCw
                  className={`mr-1 h-4 w-4 ${resendMut.isPending ? 'animate-spin' : ''}`}
                />
              ) : (
                <Mail className="mr-1 h-4 w-4" />
              )}
              {resendMut.isPending ? 'กำลังส่ง…' : 'ส่ง email อีกครั้ง'}
            </Button>
            {order.status !== 'refunded' && id && (
              <RefundButton orderId={id} amount={order.total} />
            )}
          </div>

          {order.status === 'refunded' && order.refundedAt && (
            <div className="rounded-md border bg-amber-500/10 border-amber-500/30 p-3 text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                คืนเงินแล้ว · {new Date(order.refundedAt).toLocaleString('th-TH')}
              </p>
              {order.refundReason && (
                <p className="mt-1 text-muted-foreground">เหตุผล: {order.refundReason}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          สินค้าที่ส่ง
        </h2>
        <div className="space-y-3">
          {lines.map((line) => (
            <Card key={line.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{line.productNameSnapshot}</p>
                    <p className="text-xs text-muted-foreground">
                      {line.qty} × {formatPriceTHB(line.unitPrice)}
                    </p>
                  </div>
                  <Badge variant="outline">{line.delivered.length} รายการ</Badge>
                </div>
                <div className="space-y-2">
                  {line.delivered.map((d) => (
                    <pre
                      key={d.id}
                      className="overflow-x-auto whitespace-pre-wrap break-all rounded-md border bg-muted/30 p-2 font-mono text-xs"
                    >
                      {d.payload}
                    </pre>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function RefundButton({ orderId, amount }: { orderId: string; amount: string }) {
  const [open, setOpen] = useState(false)
  const [restoreStock, setRestoreStock] = useState(false)
  const [reason, setReason] = useState('')
  const refundMut = useRefundOrder()

  const onSubmit = async () => {
    try {
      const res = await refundMut.mutateAsync({
        id: orderId,
        restoreStock,
        reason: reason.trim() || undefined,
      })
      toast.success(
        `คืนเงิน ${formatPriceTHB(res.refundAmount)} แล้ว` +
          (res.restoredCount ? ` · คืน stock ${res.restoredCount} ชิ้น` : ''),
      )
      setOpen(false)
      setReason('')
      setRestoreStock(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'คืนเงินไม่สำเร็จ')
    }
  }

  if (!open) {
    return (
      <Button variant="destructive" onClick={() => setOpen(true)}>
        <RotateCcw className="mr-1 h-4 w-4" /> คืนเงิน {formatPriceTHB(amount)}
      </Button>
    )
  }

  return (
    <div className="w-full rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
      <p className="mb-2 font-medium">ยืนยันคืนเงิน {formatPriceTHB(amount)} ?</p>
      <div className="space-y-2">
        <div>
          <Label htmlFor="refund-reason" className="text-xs">เหตุผล (เก็บใน audit log)</Label>
          <Input
            id="refund-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="เช่น ไอดีใช้ไม่ได้, ลูกค้าขอยกเลิก"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={restoreStock}
            onChange={(e) => setRestoreStock(e.target.checked)}
            className="h-4 w-4"
          />
          <span>คืน stock items กลับเข้าคลัง (ถ้าใช้งานได้อยู่)</span>
        </label>
        <div className="flex gap-2 pt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onSubmit}
            disabled={refundMut.isPending}
          >
            {refundMut.isPending ? 'กำลังคืน…' : 'ยืนยันคืนเงิน'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpen(false)
              setReason('')
              setRestoreStock(false)
            }}
          >
            ยกเลิก
          </Button>
        </div>
      </div>
    </div>
  )
}
