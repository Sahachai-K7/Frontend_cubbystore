import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useAdminCategories } from '@/features/admin/categories.api'
import type { AdminProduct } from '@/lib/types'

export const ProductFormSchema = z.object({
  name: z.string().min(1, 'ใส่ชื่อสินค้า').max(200),
  slug: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).max(9_999_999.99),
  isActive: z.boolean(),
})
export type ProductFormValues = z.infer<typeof ProductFormSchema>

export function ProductForm({
  defaults,
  submitting,
  submitLabel,
  onSubmit,
}: {
  defaults?: Partial<AdminProduct>
  submitting?: boolean
  submitLabel: string
  onSubmit: (data: ProductFormValues) => void | Promise<void>
}) {
  const { data: cats } = useAdminCategories()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: defaults?.name ?? '',
      slug: defaults?.slug ?? '',
      categoryId: defaults?.categoryId ?? '',
      description: defaults?.description ?? '',
      price: defaults?.price ? Number(defaults.price) : 0,
      isActive: defaults?.isActive ?? true,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">ชื่อสินค้า</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (ปล่อยว่างให้ auto)</Label>
          <Input id="slug" {...register('slug')} className="font-mono text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">หมวดหมู่</Label>
          <Select id="categoryId" {...register('categoryId')}>
            <option value="">— ไม่จัดหมวด —</option>
            {cats?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">ราคา (บาท)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min={0}
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">รายละเอียด</Label>
        <Textarea
          id="description"
          rows={5}
          {...register('description')}
          placeholder="ยศ, สกินที่ติดมา, ยอดเลเวล, อื่นๆ ที่ลูกค้าควรรู้"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('isActive')} className="h-4 w-4" />
        <span>เปิดขาย (ลูกค้าเห็นในหน้า public)</span>
      </label>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'กำลังบันทึก…' : submitLabel}
      </Button>
    </form>
  )
}
