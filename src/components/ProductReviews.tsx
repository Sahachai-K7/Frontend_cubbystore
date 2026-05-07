import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Stars, StarsInput } from '@/components/Stars'
import {
  useCreateReview,
  useProductReviews,
  useReviewable,
} from '@/features/reviews/reviews.api'
import { useSession } from '@/lib/auth-client'

export function ProductReviews({
  slug,
  productId,
}: {
  slug: string
  productId: string
}) {
  const [page, setPage] = useState(1)
  const { data: session } = useSession()
  const { data, isPending } = useProductReviews(slug, page)
  const { data: reviewable } = useReviewable(!!session)

  const myReviewable =
    reviewable?.find(
      (r) => r.productId === productId && !r.existingReviewId,
    ) ?? null
  const alreadyReviewed = !!reviewable?.find(
    (r) => r.productId === productId && r.existingReviewId,
  )

  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / data.limit))
    : 1

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold tracking-tight">รีวิว</h2>
        {data && data.summary.count > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Stars value={data.summary.avg} size="sm" />
            <span className="font-semibold">
              {data.summary.avg.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({data.summary.count} รีวิว)
            </span>
          </div>
        )}
      </div>

      {myReviewable && (
        <ReviewForm
          orderItemId={myReviewable.orderItemId}
          productName={myReviewable.productNameSnapshot}
        />
      )}

      {alreadyReviewed && !myReviewable && (
        <div className="mb-4 rounded-md border border-secondary/50 bg-secondary/20 p-3 text-sm text-muted-foreground">
          คุณรีวิวสินค้านี้แล้ว — ขอบคุณสำหรับ feedback!
        </div>
      )}

      {isPending && (
        <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
      )}

      {data && data.items.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            ยังไม่มีรีวิว
            {session && !myReviewable && !alreadyReviewed
              ? ' — สั่งซื้อสินค้านี้เพื่อรีวิวเป็นคนแรก'
              : ''}
          </CardContent>
        </Card>
      )}

      {data && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Stars value={r.rating} size="xs" />
                    <span className="text-sm font-medium">
                      {r.userName ?? 'ผู้ใช้'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
                {r.comment && (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {r.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ← ก่อนหน้า
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
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
    </section>
  )
}

function ReviewForm({
  orderItemId,
  productName,
}: {
  orderItemId: string
  productName: string
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const createMut = useCreateReview()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1) {
      toast.error('กรุณาให้ดาวก่อน')
      return
    }
    try {
      await createMut.mutateAsync({
        orderItemId,
        rating,
        comment: comment.trim() || null,
      })
      toast.success('ส่งรีวิวแล้ว ขอบคุณครับ')
      setRating(0)
      setComment('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ส่งไม่สำเร็จ')
    }
  }

  return (
    <Card className="mb-4">
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-sm font-medium">เขียนรีวิว "{productName}"</p>
          <p className="text-xs text-muted-foreground">
            คุณซื้อสินค้านี้แล้ว — แชร์ประสบการณ์ให้คนอื่น
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <StarsInput value={rating} onChange={setRating} />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="คอมเมนต์ (ไม่บังคับ)"
            maxLength={1000}
          />
          <Button type="submit" size="sm" disabled={createMut.isPending}>
            {createMut.isPending ? 'กำลังส่ง…' : 'ส่งรีวิว'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
