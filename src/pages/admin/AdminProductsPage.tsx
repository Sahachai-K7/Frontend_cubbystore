import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertTriangle, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from '@/components/ui/responsive-table'
import {
  useAdminProducts,
  useDeleteProduct,
  useUpdateProduct,
  type AdminProductListItem,
} from '@/features/admin/products.api'
import { useAdminCategories } from '@/features/admin/categories.api'
import { ApiError } from '@/lib/api'
import { API_BASE_URL } from '@/lib/env'
import { cn, formatPriceTHB } from '@/lib/utils'

export function AdminProductsPage() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [active, setActive] = useState<'' | 'true' | 'false'>('')
  const [categoryId, setCategoryId] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(
    params.get('lowStock') === 'true',
  )

  // Read URL param once on mount
  useEffect(() => {
    if (params.get('lowStock') === 'true') setLowStockOnly(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync state → URL so links/bookmarks work
  useEffect(() => {
    const next = new URLSearchParams(params)
    if (lowStockOnly) next.set('lowStock', 'true')
    else next.delete('lowStock')
    if (next.toString() !== params.toString())
      setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lowStockOnly])

  const { data: cats } = useAdminCategories()
  const { data: products, isPending } = useAdminProducts({
    q: q || undefined,
    active: active || undefined,
    categoryId: categoryId || undefined,
    lowStock: lowStockOnly ? 'true' : undefined,
    threshold: 5,
  })

  const delMut = useDeleteProduct()
  const updateMut = useUpdateProduct()

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`ลบสินค้า "${name}"? ของในคลัง (stock items) จะถูกลบทั้งหมด`))
      return
    try {
      await delMut.mutateAsync(id)
      toast.success('ลบสินค้าแล้ว')
    } catch (err: unknown) {
      const code =
        err instanceof ApiError &&
        err.body &&
        typeof err.body === 'object' &&
        'error' in err.body
          ? String((err.body as { error: unknown }).error)
          : null
      if (code === 'product_has_orders') {
        if (
          confirm(
            `ลบไม่ได้เพราะเคยมีคนซื้อสินค้านี้แล้ว — ต้องการ "ปิดขาย" แทน?\n(ลูกค้าจะไม่เห็นในเว็บอีก แต่ประวัติออเดอร์จะยังอยู่)`,
          )
        ) {
          try {
            await updateMut.mutateAsync({ id, isActive: false })
            toast.success('ปิดขายแล้ว')
          } catch (e2: unknown) {
            toast.error(e2 instanceof Error ? e2.message : 'ปิดขายไม่สำเร็จ')
          }
        }
        return
      }
      toast.error(err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">สินค้า</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            จัดการสินค้า, รูปภาพ และคลังไอดีต่อรายการ
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className={cn(buttonVariants(), 'shrink-0')}
        >
          <Plus className="mr-1 h-4 w-4" /> สร้างสินค้า
        </Link>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_140px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาชื่อสินค้า…"
                className="pl-8"
              />
            </div>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">หมวดทั้งหมด</option>
              {cats?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={active}
              onChange={(e) => setActive(e.target.value as '' | 'true' | 'false')}
            >
              <option value="">สถานะทั้งหมด</option>
              <option value="true">เปิดขาย</option>
              <option value="false">ปิด</option>
            </Select>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-4 w-4"
            />
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>แสดงเฉพาะ stock เหลือน้อย (&lt; 5)</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ResponsiveTable
            data={products}
            columns={
              [
                {
                  key: 'image',
                  label: 'รูป',
                  hideOnMobile: true,
                  className: 'w-12',
                  render: (p) =>
                    p.imageUrl ? (
                      <img
                        src={`${API_BASE_URL}${p.imageUrl}`}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted" />
                    ),
                },
                {
                  key: 'name',
                  label: 'ชื่อ',
                  render: (p) => (
                    <span className="block">
                      <span className="block font-medium">{p.name}</span>
                      <span className="block font-mono text-xs text-muted-foreground">
                        {p.slug}
                      </span>
                    </span>
                  ),
                },
                {
                  key: 'price',
                  label: 'ราคา',
                  render: (p) => (
                    <span className="tabular-nums">
                      {formatPriceTHB(p.price)}
                    </span>
                  ),
                },
                {
                  key: 'available',
                  label: 'เหลือ',
                  align: 'right',
                  render: (p) => {
                    if (p.availableCount === 0)
                      return <Badge variant="destructive">หมด</Badge>
                    if (p.availableCount < 5)
                      return (
                        <Badge
                          variant="outline"
                          className="border-amber-500/50 text-amber-700 dark:text-amber-400"
                        >
                          {p.availableCount}
                        </Badge>
                      )
                    return (
                      <span className="tabular-nums">{p.availableCount}</span>
                    )
                  },
                },
                {
                  key: 'sold',
                  label: 'ขายแล้ว',
                  align: 'right',
                  render: (p) => (
                    <span className="tabular-nums">{p.soldCount}</span>
                  ),
                },
                {
                  key: 'status',
                  label: 'สถานะ',
                  render: (p) =>
                    p.isActive ? (
                      <Badge variant="secondary">เปิดขาย</Badge>
                    ) : (
                      <Badge variant="outline">ปิด</Badge>
                    ),
                },
                {
                  key: 'actions',
                  label: 'การจัดการ',
                  align: 'right',
                  render: (p) => (
                    <div
                      className="flex justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        to={`/admin/products/${p.id}`}
                        className={cn(
                          buttonVariants({ size: 'sm', variant: 'outline' }),
                        )}
                      >
                        แก้ไข
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onDelete(p.id, p.name)
                        }}
                        disabled={delMut.isPending}
                        aria-label="ลบ"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ),
                },
              ] satisfies ResponsiveTableColumn<AdminProductListItem>[]
            }
            rowKey={(p) => p.id}
            loading={isPending}
            emptyMessage={
              lowStockOnly
                ? 'ไม่มีสินค้า stock ต่ำ — เยี่ยมมาก!'
                : 'ยังไม่มีสินค้า — กดปุ่ม "สร้างสินค้า" ที่มุมขวาบน'
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
