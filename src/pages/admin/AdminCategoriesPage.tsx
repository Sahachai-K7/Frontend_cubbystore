import { useState } from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/admin/categories.api'
import type { Category } from '@/lib/types'

const Schema = z.object({
  name: z.string().min(1, 'ใส่ชื่อหมวดหมู่'),
  slug: z.string().optional(),
  sortOrder: z.number().int().min(0),
})
type FormValues = z.infer<typeof Schema>

export function AdminCategoriesPage() {
  const { data: items, isPending } = useAdminCategories()
  const createMut = useCreateCategory()
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { sortOrder: 0 },
  })

  const onCreate = async (data: FormValues) => {
    try {
      await createMut.mutateAsync({
        name: data.name,
        slug: data.slug || undefined,
        sortOrder: data.sortOrder,
      })
      toast.success('เพิ่มหมวดหมู่แล้ว')
      reset({ name: '', slug: '', sortOrder: 0 })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'เพิ่มไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">หมวดหมู่</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ใช้จัดกลุ่มสินค้า — ลูกค้า filter หน้า public ด้วย slug
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">เพิ่มหมวดหมู่ใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onCreate)} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
            <div>
              <Label htmlFor="cat-name">ชื่อ</Label>
              <Input id="cat-name" {...register('name')} placeholder="เช่น ROV, Free Fire" />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cat-slug">Slug (ไม่ใส่ก็ได้)</Label>
              <Input id="cat-slug" {...register('slug')} placeholder="rov" />
            </div>
            <div>
              <Label htmlFor="cat-sort">ลำดับ</Label>
              <Input
                id="cat-sort"
                type="number"
                {...register('sortOrder', { valueAsNumber: true })}
                className="w-20"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={createMut.isPending}>
                <Plus className="mr-1 h-4 w-4" />
                {createMut.isPending ? 'กำลังเพิ่ม…' : 'เพิ่ม'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">รายการทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending && <p className="text-sm text-muted-foreground">กำลังโหลด…</p>}
          {items && items.length === 0 && (
            <p className="text-sm text-muted-foreground">ยังไม่มีหมวดหมู่ — เพิ่มด้านบน</p>
          )}
          {items && items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-2 py-2">ชื่อ</th>
                    <th className="px-2 py-2">Slug</th>
                    <th className="px-2 py-2 w-20">ลำดับ</th>
                    <th className="px-2 py-2 text-right w-32"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) =>
                    editingId === c.id ? (
                      <CategoryEditRow
                        key={c.id}
                        item={c}
                        onCancel={() => setEditingId(null)}
                        onSaved={() => setEditingId(null)}
                      />
                    ) : (
                      <CategoryRow
                        key={c.id}
                        item={c}
                        onEdit={() => setEditingId(c.id)}
                      />
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CategoryRow({ item, onEdit }: { item: Category; onEdit: () => void }) {
  const delMut = useDeleteCategory()
  const onDelete = async () => {
    if (!confirm(`ลบหมวด "${item.name}"?`)) return
    try {
      await delMut.mutateAsync(item.id)
      toast.success('ลบแล้ว')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
    }
  }
  return (
    <tr className="border-t">
      <td className="px-2 py-2 font-medium">{item.name}</td>
      <td className="px-2 py-2 font-mono text-xs text-muted-foreground">{item.slug}</td>
      <td className="px-2 py-2">{item.sortOrder}</td>
      <td className="px-2 py-2 text-right">
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="outline" onClick={onEdit}>
            แก้
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={delMut.isPending}
            aria-label="ลบ"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function CategoryEditRow({
  item,
  onCancel,
  onSaved,
}: {
  item: Category
  onCancel: () => void
  onSaved: () => void
}) {
  const updateMut = useUpdateCategory()
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: item.name, slug: item.slug, sortOrder: item.sortOrder },
  })
  const onSave = async (data: FormValues) => {
    try {
      await updateMut.mutateAsync({
        id: item.id,
        name: data.name,
        slug: data.slug,
        sortOrder: data.sortOrder,
      })
      toast.success('บันทึกแล้ว')
      onSaved()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }
  return (
    <tr className="border-t bg-muted/30">
      <td className="px-2 py-2"><Input {...register('name')} /></td>
      <td className="px-2 py-2"><Input {...register('slug')} className="font-mono text-xs" /></td>
      <td className="px-2 py-2"><Input type="number" {...register('sortOrder')} className="w-20" /></td>
      <td className="px-2 py-2 text-right">
        <div className="flex justify-end gap-1">
          <Button size="sm" onClick={handleSubmit(onSave)} disabled={updateMut.isPending}>
            <Save className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
