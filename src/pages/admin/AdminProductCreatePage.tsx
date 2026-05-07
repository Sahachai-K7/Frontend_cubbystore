import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductForm, type ProductFormValues } from '@/features/admin/ProductForm'
import { useCreateProduct } from '@/features/admin/products.api'

export function AdminProductCreatePage() {
  const navigate = useNavigate()
  const createMut = useCreateProduct()

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const res = await createMut.mutateAsync({
        name: data.name,
        slug: data.slug || undefined,
        categoryId: data.categoryId || null,
        description: data.description || null,
        price: data.price,
        isActive: data.isActive,
      })
      toast.success('สร้างสินค้าแล้ว — ขั้นถัดไป: อัปโหลดรูป + เพิ่มของในคลัง')
      navigate(`/admin/products/${res.item.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'สร้างไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-4">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> สินค้าทั้งหมด
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>สร้างสินค้าใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            submitting={createMut.isPending}
            submitLabel="สร้างสินค้า"
            onSubmit={onSubmit}
          />
        </CardContent>
      </Card>
    </div>
  )
}
