import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Stars } from '@/components/Stars'
import {
  useAdminReviews,
  useDeleteReview,
  useRestoreReview,
} from '@/features/reviews/reviews.api'

export function AdminReviewsPage() {
  const [deleted, setDeleted] = useState<'' | 'true' | 'false'>('false')
  const [page, setPage] = useState(1)
  const { data, isPending } = useAdminReviews({
    deleted: (deleted as 'true' | 'false') || undefined,
    page,
  })
  const delMut = useDeleteReview()
  const restoreMut = useRestoreReview()

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  const onDelete = async (id: string) => {
    if (!confirm('ลบรีวิวนี้? (ลูกค้าจะไม่เห็นแล้ว แต่ข้อมูลยังเก็บไว้)')) return
    try {
      await delMut.mutateAsync(id)
      toast.success('ลบแล้ว')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
    }
  }

  const onRestore = async (id: string) => {
    try {
      await restoreMut.mutateAsync(id)
      toast.success('คืนค่าแล้ว')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'คืนค่าไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">รีวิว</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          จัดการรีวิวทั้งหมด — ลบเฉพาะที่ไม่เหมาะสม (soft delete, คืนค่าได้)
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Select
              value={deleted}
              onChange={(e) => {
                setDeleted(e.target.value as '' | 'true' | 'false')
                setPage(1)
              }}
              className="md:w-64"
            >
              <option value="false">เฉพาะที่ยังแสดง</option>
              <option value="true">เฉพาะที่ถูกลบ</option>
              <option value="">ทั้งหมด</option>
            </Select>
            <span className="ml-auto text-sm text-muted-foreground">
              {data ? `${data.total} รายการ` : '…'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isPending && (
            <p className="px-4 pb-4 pt-4 text-sm text-muted-foreground">กำลังโหลด…</p>
          )}
          {data && data.items.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">ไม่มีรายการ</p>
          )}
          {data && data.items.length > 0 && (
            <div className="divide-y">
              {data.items.map((r) => (
                <div key={r.id} className="space-y-2 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      {r.productSlug ? (
                        <Link
                          to={`/products/${r.productSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium hover:underline"
                        >
                          {r.productName ?? r.productId}
                        </Link>
                      ) : (
                        <span className="font-medium">{r.productName ?? r.productId}</span>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{r.userName ?? r.userEmail ?? r.userId}</span>
                        <span>·</span>
                        <span>{new Date(r.createdAt).toLocaleString('th-TH')}</span>
                        {r.deletedByAdmin && (
                          <Badge variant="destructive" className="text-[10px]">
                            ถูกลบ
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Stars value={r.rating} size="sm" />
                  </div>
                  {r.comment && (
                    <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-2 text-sm">
                      {r.comment}
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    {r.deletedByAdmin ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRestore(r.id)}
                        disabled={restoreMut.isPending}
                      >
                        <RotateCcw className="mr-1 h-4 w-4" /> คืนค่า
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(r.id)}
                        disabled={delMut.isPending}
                      >
                        <Trash2 className="mr-1 h-4 w-4 text-destructive" /> ลบ
                      </Button>
                    )}
                  </div>
                </div>
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
