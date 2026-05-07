import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  useAddIp,
  useDeleteIp,
  useIpAllowlist,
  useUpdateIp,
} from '@/features/admin/ip.api'

const Schema = z.object({
  cidr: z.string().min(1, 'ใส่ CIDR'),
  label: z.string().max(100).optional(),
})
type FormValues = z.infer<typeof Schema>

export function AdminIpAllowlistPage() {
  const { data, isPending } = useIpAllowlist()
  const addMut = useAddIp()
  const updateMut = useUpdateIp()
  const deleteMut = useDeleteIp()
  const [showWarning, setShowWarning] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) })

  const onAdd = async (v: FormValues) => {
    try {
      await addMut.mutateAsync({
        cidr: v.cidr.trim(),
        label: v.label?.trim() || null,
        enabled: true,
      })
      toast.success('เพิ่มแล้ว')
      reset({ cidr: '', label: '' })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'เพิ่มไม่สำเร็จ')
    }
  }

  const onToggle = async (id: string, enabled: boolean) => {
    try {
      await updateMut.mutateAsync({ id, enabled })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'อัพเดตไม่สำเร็จ')
    }
  }

  const onDelete = async (id: string, cidr: string) => {
    if (!confirm(`ลบ ${cidr}?`)) return
    try {
      await deleteMut.mutateAsync(id)
      toast.success('ลบแล้ว')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">IP Allowlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          เฉพาะ IP ในรายการนี้ถึงจะเข้าหน้า admin ได้
        </p>
      </div>

      {showWarning && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <p className="font-medium text-amber-700 dark:text-amber-300">⚠️ ระวังล็อกตัวเอง</p>
          <p className="mt-1 text-amber-700/80 dark:text-amber-300/80">
            ตอนนี้คุณเข้าถึงหน้า admin ได้เพราะ IP ในตัวแปรแวดล้อม{' '}
            <code className="text-xs">ADMIN_IP_BOOTSTRAP</code> หลังจากเพิ่มในนี้แล้ว
            ค่อยถอด bootstrap CIDR ตอน deploy production ตรวจสอบให้แน่ใจว่าได้เพิ่ม IP ตัวเองก่อน
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="ml-2 underline"
            >
              ปิด
            </button>
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">เพิ่ม CIDR</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onAdd)}
            className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <Label htmlFor="cidr">CIDR</Label>
              <Input
                id="cidr"
                {...register('cidr')}
                placeholder="เช่น 1.2.3.4/32 หรือ 192.168.1.0/24"
                className="font-mono"
              />
              {errors.cidr && (
                <p className="mt-1 text-xs text-destructive">{errors.cidr.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="label">ป้ายกำกับ</Label>
              <Input id="label" {...register('label')} placeholder="เช่น Office, บ้าน" />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={addMut.isPending}>
                <Plus className="mr-1 h-4 w-4" />
                เพิ่ม
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">รายการที่อนุญาต</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isPending && (
            <p className="px-6 pb-6 text-sm text-muted-foreground">กำลังโหลด…</p>
          )}
          {data && data.length === 0 && (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              ยังไม่มี — เพิ่มด้านบน
            </p>
          )}
          {data && data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-3 py-2">CIDR</th>
                    <th className="px-3 py-2">ป้าย</th>
                    <th className="px-3 py-2">เพิ่มเมื่อ</th>
                    <th className="px-3 py-2">สถานะ</th>
                    <th className="px-3 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-mono text-xs">{row.cidr}</td>
                      <td className="px-3 py-2">{row.label ?? '—'}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {new Date(row.addedAt).toLocaleString('th-TH')}
                      </td>
                      <td className="px-3 py-2">
                        {row.enabled ? (
                          <Badge variant="secondary">เปิด</Badge>
                        ) : (
                          <Badge variant="outline">ปิด</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onToggle(row.id, !row.enabled)}
                          >
                            {row.enabled ? 'ปิด' : 'เปิด'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(row.id, row.cidr)}
                            aria-label="ลบ"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
