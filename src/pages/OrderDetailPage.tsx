import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ClipboardCopy, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMyOrder } from '@/features/orders/orders.api'
import { useReviewable } from '@/features/reviews/reviews.api'
import { formatPriceTHB } from '@/lib/utils'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isPending, error } = useMyOrder(id)
  const { data: reviewable } = useReviewable()
  const reviewableMap = new Map(
    (reviewable ?? []).map((r) => [r.orderItemId, r]),
  )

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('คัดลอกแล้ว')
    } catch {
      toast.error('คัดลอกไม่สำเร็จ')
    }
  }

  if (isPending) {
    return <p className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted-foreground">กำลังโหลด…</p>
  }
  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-sm text-destructive">ไม่พบคำสั่งซื้อ</p>
        <Link to="/orders" className="mt-2 inline-block text-sm text-primary hover:underline">
          ← กลับ
        </Link>
      </div>
    )
  }

  const { order, lines } = data
  const statusBadge =
    order.status === 'delivered' ? (
      <Badge variant="secondary">ส่งแล้ว</Badge>
    ) : order.status === 'delivery_failed' ? (
      <Badge variant="destructive">ส่งล้มเหลว</Badge>
    ) : (
      <Badge variant="outline">จ่ายแล้ว</Badge>
    )

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> ประวัติทั้งหมด
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-mono text-base">
                คำสั่งซื้อ {order.id.slice(0, 8)}
              </CardTitle>
              <CardDescription>
                {new Date(order.createdAt).toLocaleString('th-TH')}
                {order.deliveredAt && ` · ส่ง ${new Date(order.deliveredAt).toLocaleString('th-TH')}`}
              </CardDescription>
            </div>
            <div className="text-right">
              {statusBadge}
              <p className="mt-1 text-lg font-semibold">{formatPriceTHB(order.total)}</p>
            </div>
          </div>
        </CardHeader>
        {order.status === 'delivery_failed' && (
          <CardContent>
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              ส่ง email ไม่สำเร็จ: {order.deliveryError ?? 'ไม่ทราบสาเหตุ'} —
              ติดต่อแอดมินเพื่อ resend
            </div>
          </CardContent>
        )}
      </Card>

      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        สินค้าที่ได้รับ
      </h2>
      <div className="space-y-3">
        {lines.map((line) => {
          const r = reviewableMap.get(line.id)
          const canReview = !!r && !r.existingReviewId && r.productSlug
          const alreadyReviewed = !!r && !!r.existingReviewId
          return (
          <Card key={line.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{line.productNameSnapshot}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.qty} × {formatPriceTHB(line.unitPrice)} ={' '}
                    {formatPriceTHB(Number(line.unitPrice) * line.qty)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline">{line.delivered.length} ส่งแล้ว</Badge>
                  {canReview && r?.productSlug && (
                    <Link
                      to={`/products/${r.productSlug}#reviews`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Star className="h-3 w-3" /> เขียนรีวิว
                    </Link>
                  )}
                  {alreadyReviewed && (
                    <span className="text-xs text-muted-foreground">รีวิวแล้ว</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {line.delivered.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-start gap-2 rounded-md border bg-muted/30 p-2"
                  >
                    <pre className="flex-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs">
                      {d.payload}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCopy(d.payload)}
                      aria-label="คัดลอก"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )
        })}
      </div>
    </section>
  )
}
