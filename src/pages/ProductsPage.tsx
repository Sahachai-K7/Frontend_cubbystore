import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import {
  usePublicCategories,
  usePublicProducts,
  type SortKey,
} from '@/features/catalog/public.api'
import { cn } from '@/lib/utils'

const sortLabels: Record<SortKey, string> = {
  newest: 'ใหม่ล่าสุด',
  popular: 'ขายดี',
  price_asc: 'ราคาน้อย → มาก',
  price_desc: 'ราคามาก → น้อย',
  oldest: 'เก่าสุด',
}

const PAGE_SIZE = 24

export function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const categorySlug = params.get('category') ?? undefined
  const q = params.get('q') ?? ''
  const sort = (params.get('sort') as SortKey | null) ?? 'newest'
  const page = Number(params.get('page') ?? '1') || 1

  const [searchInput, setSearchInput] = useState(q)
  useEffect(() => setSearchInput(q), [q])

  const { data: categories } = usePublicCategories()
  const { data, isPending } = usePublicProducts({
    categorySlug,
    q: q || undefined,
    sort,
    page,
    limit: PAGE_SIZE,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params)
    if (value && value.length > 0) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: false })
  }

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('q', searchInput.trim() || undefined)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">สินค้าทั้งหมด</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.total} รายการ` : 'กำลังโหลด…'}
          </p>
        </div>
        <form onSubmit={onSubmitSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า…"
              className="pl-8 md:w-64"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            ค้นหา
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-2">
            <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              หมวดหมู่
            </p>
            <nav className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => updateParam('category', undefined)}
                className={cn(
                  'rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                  !categorySlug
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                ทั้งหมด
              </button>
              {categories?.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateParam('category', c.slug)}
                  className={cn(
                    'rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                    categorySlug === c.slug
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {c.name}
                </button>
              ))}
            </nav>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              เรียงตาม
            </label>
            <Select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
            >
              {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {sortLabels[k]}
                </option>
              ))}
            </Select>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {isPending &&
              Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            {data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          {data && data.items.length === 0 && (
            <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
              ไม่พบสินค้าตามเงื่อนไข
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParam('page', String(page - 1))}
              >
                ← ก่อนหน้า
              </Button>
              <span className="text-sm text-muted-foreground">
                หน้า {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => updateParam('page', String(page + 1))}
              >
                ถัดไป →
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
