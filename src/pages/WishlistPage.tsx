import { Link } from 'react-router-dom'
import { Heart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  useRemoveWishlist,
  useWishlist,
} from '@/features/wishlist/wishlist.api'
import { API_BASE_URL } from '@/lib/env'
import { cn, formatPriceTHB } from '@/lib/utils'

export function WishlistPage() {
  const { data, isPending } = useWishlist()
  const removeMut = useRemoveWishlist()

  const onRemove = async (productId: string) => {
    try {
      await removeMut.mutateAsync(productId)
      toast.success('ลบแล้ว')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Heart className="h-6 w-6 text-red-500" />
        <h1 className="text-2xl font-semibold tracking-tight">รายการแจ้งเตือน</h1>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        เก็บสินค้าไว้รอ — เราจะส่ง email แจ้งเตือนเมื่อของกลับมาขายอีกครั้ง
      </p>

      {isPending && <p className="text-sm text-muted-foreground">กำลังโหลด…</p>}

      {data && data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <Heart className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              ยังไม่มีสินค้าใน wishlist
            </p>
            <Link to="/products" className="text-sm text-primary hover:underline">
              ไปเลือกสินค้า →
            </Link>
          </CardContent>
        </Card>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.map((w) => {
            const out = w.availableCount === 0
            return (
              <Card key={w.productId} className="overflow-hidden">
                <CardContent className="flex gap-3 p-3">
                  <Link
                    to={`/products/${w.slug}`}
                    className="block h-20 w-20 shrink-0 overflow-hidden rounded bg-muted/30"
                  >
                    {w.imageUrl ? (
                      <img
                        src={`${API_BASE_URL}${w.imageUrl}`}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${w.slug}`}
                      className="line-clamp-2 text-sm font-medium hover:underline"
                    >
                      {w.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatPriceTHB(w.price)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {out ? (
                        <Badge variant="destructive">หมดชั่วคราว</Badge>
                      ) : (
                        <Badge variant="secondary">
                          เหลือ {w.availableCount}
                        </Badge>
                      )}
                      {w.notifiedAt && out === false && (
                        <span className="text-xs text-emerald-600">แจ้งแล้ว ✓</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {!out && (
                      <Link
                        to={`/products/${w.slug}`}
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'whitespace-nowrap',
                        )}
                      >
                        ไปซื้อ
                      </Link>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(w.productId)}
                      aria-label="ลบ"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
