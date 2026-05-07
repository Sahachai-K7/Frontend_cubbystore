import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Stars } from '@/components/Stars'
import { resolveImageUrl } from '@/lib/env'
import { formatPriceTHB } from '@/lib/utils'
import type { ProductListItem } from '@/lib/types'

export function ProductCard({ product }: { product: ProductListItem }) {
  const outOfStock = product.availableCount === 0

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-foreground/30"
    >
      <div className="relative aspect-[4/3] w-full bg-muted/30">
        {product.imageUrl ? (
          <img
            src={resolveImageUrl(product.imageUrl)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            ไม่มีรูป
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <Badge variant="destructive">หมดชั่วคราว</Badge>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">
          {product.name}
        </h3>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Stars value={Number(product.avgRating)} size="xs" />
            <span>
              {Number(product.avgRating).toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        )}
        <div className="mt-auto flex items-end justify-between pt-2">
          <p className="text-base font-semibold">{formatPriceTHB(product.price)}</p>
          <p className="text-xs text-muted-foreground">
            {outOfStock
              ? 'หมดชั่วคราว'
              : `เหลือ ${product.availableCount} รายการ`}
          </p>
        </div>
        {product.soldCount > 0 && (
          <p className="text-xs text-muted-foreground">
            ขายไปแล้ว {product.soldCount} ชิ้น
          </p>
        )}
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-card">
      <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
