import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PlatformIcon,
  platformBrandColor,
  platformLabels,
} from '@/components/PlatformIcon'
import {
  useAdminContactLinks,
  useCreateContactLink,
  useDeleteContactLink,
  useUpdateContactLink,
} from '@/features/contact/contact.api'
import type { ContactLinkAdmin, ContactPlatform } from '@/lib/types'
import { cn } from '@/lib/utils'

const Schema = z.object({
  platform: z.enum([
    'line',
    'discord',
    'telegram',
    'facebook',
    'instagram',
    'x',
    'email',
    'phone',
    'other',
  ]),
  label: z.string().min(1, 'ใส่ชื่อ').max(80),
  url: z.string().min(1, 'ใส่ URL').max(500),
  sortOrder: z.number().int().min(0),
})
type FormValues = z.infer<typeof Schema>

const platforms: ContactPlatform[] = [
  'line',
  'discord',
  'telegram',
  'facebook',
  'instagram',
  'x',
  'email',
  'phone',
  'other',
]

export function AdminContactLinksPage() {
  const { data, isPending } = useAdminContactLinks()
  const createMut = useCreateContactLink()
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      platform: 'line',
      label: 'LINE Official',
      url: '',
      sortOrder: 0,
    },
  })

  const onCreate = async (v: FormValues) => {
    try {
      await createMut.mutateAsync(v)
      toast.success('เพิ่มแล้ว')
      reset({ platform: 'line', label: '', url: '', sortOrder: 0 })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'เพิ่มไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ช่องทางติดต่อ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ลิงก์ที่ปรากฏในเมนู "ติดต่อ" บนหัวเว็บ — เปิด/ปิด เรียงลำดับได้
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">เพิ่มช่องทางใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onCreate)}
            className="grid gap-3 md:grid-cols-[140px_1fr_2fr_80px_auto]"
          >
            <div>
              <Label htmlFor="platform" className="text-xs">แพลตฟอร์ม</Label>
              <Select id="platform" {...register('platform')}>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {platformLabels[p]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="label" className="text-xs">ชื่อที่แสดง</Label>
              <Input id="label" {...register('label')} placeholder="เช่น @cubbystore" />
              {errors.label && (
                <p className="mt-1 text-xs text-destructive">{errors.label.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="url" className="text-xs">URL</Label>
              <Input
                id="url"
                {...register('url')}
                placeholder="https://line.me/R/ti/p/@..."
                className="font-mono text-xs"
              />
              {errors.url && (
                <p className="mt-1 text-xs text-destructive">{errors.url.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="sortOrder" className="text-xs">ลำดับ</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                {...register('sortOrder', { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={createMut.isPending}>
                <Plus className="mr-1 h-4 w-4" />
                {createMut.isPending ? '…' : 'เพิ่ม'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">รายการทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isPending && (
            <p className="px-4 pb-4 pt-4 text-sm text-muted-foreground">กำลังโหลด…</p>
          )}
          {data && data.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">
              ยังไม่มี — เพิ่มด้านบน เมนู "ติดต่อ" จะปรากฏเมื่อมีอย่างน้อย 1 รายการที่เปิดใช้
            </p>
          )}
          {data && data.length > 0 && (
            <div className="divide-y">
              {data.map((row) =>
                editingId === row.id ? (
                  <RowEdit
                    key={row.id}
                    row={row}
                    onCancel={() => setEditingId(null)}
                    onDone={() => setEditingId(null)}
                  />
                ) : (
                  <RowView
                    key={row.id}
                    row={row}
                    onEdit={() => setEditingId(row.id)}
                  />
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function RowView({
  row,
  onEdit,
}: {
  row: ContactLinkAdmin
  onEdit: () => void
}) {
  const updateMut = useUpdateContactLink()
  const delMut = useDeleteContactLink()

  const onToggle = () =>
    updateMut.mutate({ id: row.id, enabled: !row.enabled })

  const onDelete = async () => {
    if (!confirm(`ลบ "${row.label}"?`)) return
    try {
      await delMut.mutateAsync(row.id)
      toast.success('ลบแล้ว')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <PlatformIcon
        platform={row.platform}
        className={cn('h-6 w-6', platformBrandColor[row.platform])}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.label}</span>
          <Badge variant="outline" className="text-[10px]">
            {platformLabels[row.platform]}
          </Badge>
          {!row.enabled && <Badge variant="destructive" className="text-[10px]">ปิด</Badge>}
          <span className="text-xs text-muted-foreground">#{row.sortOrder}</span>
        </div>
        <a
          href={row.url}
          target="_blank"
          rel="noreferrer"
          className="block truncate font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          {row.url}
        </a>
      </div>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="outline" onClick={onToggle} disabled={updateMut.isPending}>
          {row.enabled ? 'ปิด' : 'เปิด'}
        </Button>
        <Button size="sm" variant="outline" onClick={onEdit}>
          แก้ไข
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} disabled={delMut.isPending} aria-label="ลบ">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

function RowEdit({
  row,
  onCancel,
  onDone,
}: {
  row: ContactLinkAdmin
  onCancel: () => void
  onDone: () => void
}) {
  const updateMut = useUpdateContactLink()
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      platform: row.platform,
      label: row.label,
      url: row.url,
      sortOrder: row.sortOrder,
    },
  })

  const onSave = async (v: FormValues) => {
    try {
      await updateMut.mutateAsync({ id: row.id, ...v })
      toast.success('บันทึกแล้ว')
      onDone()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }

  return (
    <div className="bg-muted/30 px-4 py-3">
      <form
        onSubmit={handleSubmit(onSave)}
        className="grid gap-2 md:grid-cols-[140px_1fr_2fr_80px_auto]"
      >
        <Select {...register('platform')}>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {platformLabels[p]}
            </option>
          ))}
        </Select>
        <Input {...register('label')} />
        <Input {...register('url')} className="font-mono text-xs" />
        <Input type="number" min={0} {...register('sortOrder', { valueAsNumber: true })} />
        <div className="flex gap-1">
          <Button type="submit" size="sm" disabled={updateMut.isPending} aria-label="บันทึก">
            <Save className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} aria-label="ยกเลิก">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
