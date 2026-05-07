import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ProductForm, type ProductFormValues } from '@/features/admin/ProductForm'
import {
  useAdminProduct,
  useUpdateProduct,
} from '@/features/admin/products.api'
import { ProductImageUploader } from '@/features/admin/ProductImageUploader'
import { ProductStockManager } from '@/features/admin/ProductStockManager'

export function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isPending, error } = useAdminProduct(id)
  const updateMut = useUpdateProduct()

  if (isPending) {
    return <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
  }
  if (error || !product) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">ไม่พบสินค้า</p>
        <Link to="/admin/products" className="text-sm text-primary hover:underline">
          ← กลับหน้ารายการ
        </Link>
      </div>
    )
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      await updateMut.mutateAsync({
        id: product.id,
        name: data.name,
        slug: data.slug || undefined,
        categoryId: data.categoryId || null,
        description: data.description || null,
        price: data.price,
        isActive: data.isActive,
      })
      toast.success('บันทึกแล้ว')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> สินค้าทั้งหมด
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
          <CardDescription className="font-mono text-xs">
            {product.slug}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            defaults={product}
            submitting={updateMut.isPending}
            submitLabel="บันทึกการแก้ไข"
            onSubmit={onSubmit}
          />
        </CardContent>
      </Card>

      <ProductImageUploader product={product} />
      <ProductStockManager productId={product.id} />
    </div>
  )
}
