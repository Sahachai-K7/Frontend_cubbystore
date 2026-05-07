import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePaymentConfig, useSavePaymentConfig } from '@/features/admin/config.api'

const Schema = z.object({
  promptpayId: z
    .string()
    .min(1, 'ใส่ PromptPay ID')
    .max(30)
    .refine((v) => /^[0-9-]+$/.test(v), 'รับเฉพาะตัวเลขและขีด'),
  promptpayIdType: z.enum(['phone', 'citizen_id', 'tax_id', 'ewallet']),
  accountName: z.string().max(80).optional(),
})
type FormValues = z.infer<typeof Schema>

export function AdminPaymentConfigPage() {
  const { data, isPending } = usePaymentConfig()
  const saveMut = useSavePaymentConfig()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      promptpayId: '',
      promptpayIdType: 'phone',
      accountName: '',
    },
  })

  useEffect(() => {
    if (data) {
      reset({
        promptpayId: data.promptpayId,
        promptpayIdType: data.promptpayIdType,
        accountName: data.accountName ?? '',
      })
    }
  }, [data, reset])

  const onSubmit = async (v: FormValues) => {
    try {
      await saveMut.mutateAsync({
        promptpayId: v.promptpayId.replace(/[^0-9]/g, ''),
        promptpayIdType: v.promptpayIdType,
        accountName: v.accountName?.trim() || null,
      })
      toast.success('บันทึกแล้ว')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">PromptPay</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ตั้งค่า ID ของร้านที่ลูกค้าจะโอนเงินเข้า — QR จะถูกสร้างแบบ dynamic ใส่ยอดอัตโนมัติ
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">การตั้งค่า</CardTitle>
          <CardDescription>
            {data ? `อัปเดตล่าสุด: ${new Date(data.updatedAt).toLocaleString('th-TH')}` : 'ยังไม่ได้ตั้งค่า'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="promptpayIdType">ประเภท ID</Label>
                  <Select id="promptpayIdType" {...register('promptpayIdType')}>
                    <option value="phone">เบอร์มือถือ (10 หลัก)</option>
                    <option value="citizen_id">เลขบัตรประชาชน (13 หลัก)</option>
                    <option value="tax_id">เลขผู้เสียภาษี (13 หลัก)</option>
                    <option value="ewallet">PromptPay e-Wallet ID</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="promptpayId">PromptPay ID</Label>
                  <Input
                    id="promptpayId"
                    {...register('promptpayId')}
                    placeholder="0812345678"
                    className="font-mono"
                  />
                  {errors.promptpayId && (
                    <p className="text-xs text-destructive">
                      {errors.promptpayId.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accountName">ชื่อร้าน / ชื่อบัญชี (แสดงให้ลูกค้า)</Label>
                <Input id="accountName" {...register('accountName')} placeholder="เช่น Tori Game Shop" />
              </div>
              <Button type="submit" disabled={saveMut.isPending}>
                {saveMut.isPending ? 'กำลังบันทึก…' : 'บันทึก'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
