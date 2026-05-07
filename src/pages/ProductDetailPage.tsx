import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Mail, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stars } from '@/components/Stars'
import { ProductReviews } from '@/components/ProductReviews'
import { WishlistButton } from '@/components/WishlistButton'
import { usePublicProduct } from '@/features/catalog/public.api'
import { useAddToCart } from '@/features/cart/cart.api'
import { useSession } from '@/lib/auth-client'
import { ApiError } from '@/lib/api'
import { resolveImageUrl } from '@/lib/env'
import { formatPriceTHB } from '@/lib/utils'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: product, isPending, error } = usePublicProduct(slug)
  const { data: session } = useSession()
  const addMut = useAddToCart()

  if (isPending) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg bg-muted" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-semibold">ไม่พบสินค้านี้</h1>
        <Link
          to="/products"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          ← กลับไปดูสินค้าทั้งหมด
        </Link>
      </div>
    )
  }

  const outOfStock = product.availableCount === 0

  const onAddToCart = async () => {
    if (!session) {
      navigate('/login', { state: { from: `/products/${slug}` } })
      return
    }
    if (!product) return
    try {
      await addMut.mutateAsync({ productId: product.id, qty: 1 })
      toast.success('เพิ่มในตะกร้าแล้ว')
    } catch (e: unknown) {
      const code =
        e instanceof ApiError && e.body && typeof e.body === 'object' && 'error' in e.body
          ? String((e.body as { error: unknown }).error)
          : null
      if (code === 'insufficient_stock') {
        toast.error('ของในคลังไม่พอ')
      } else if (code === 'product_inactive') {
        toast.error('สินค้านี้ปิดขายชั่วคราว')
      } else {
        toast.error(e instanceof Error ? e.message : 'เพิ่มไม่สำเร็จ')
      }
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          หน้าแรก
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-foreground">
          สินค้าทั้งหมด
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`/products?category=${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:hidden"
      >
        <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg border bg-muted/30">
          {product.imageUrl ? (
            <img
              src={resolveImageUrl(product.imageUrl)}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center text-sm text-muted-foreground">
              ไม่มีรูป
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {product.category && (
            <Badge variant="outline" className="self-start">
              {product.category.name}
            </Badge>
          )}
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {outOfStock ? (
              <Badge variant="destructive">หมดชั่วคราว</Badge>
            ) : (
              <Badge variant="secondary">เหลือ {product.availableCount} รายการ</Badge>
            )}
            {product.reviewCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Stars value={Number(product.avgRating)} size="xs" />
                <span>
                  {Number(product.avgRating).toFixed(1)} ({product.reviewCount})
                </span>
              </span>
            )}
            {product.soldCount > 0 && <span>ขายไปแล้ว {product.soldCount} ชิ้น</span>}
          </div>

          <p className="text-3xl font-semibold">{formatPriceTHB(product.price)}</p>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            <Mail className="mb-1 inline-block h-4 w-4" /> ส่งทันทีทาง email
            หลังชำระเงินจากกระเป๋า
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              disabled={outOfStock || addMut.isPending}
              onClick={onAddToCart}
              className="flex-1 md:flex-none"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {outOfStock
                ? 'หมดชั่วคราว'
                : addMut.isPending
                  ? 'กำลังเพิ่ม…'
                  : 'เพิ่มในตะกร้า'}
            </Button>
            <WishlistButton
              productId={product.id}
              variant="pill"
              className="flex-shrink-0"
            />
          </div>

          {product.description && (
            <div className="mt-4 border-t pt-4">
              <h2 className="mb-2 text-sm font-medium">รายละเอียด</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <ProductReviews slug={product.slug} productId={product.id} />
    </section>
  )
}
