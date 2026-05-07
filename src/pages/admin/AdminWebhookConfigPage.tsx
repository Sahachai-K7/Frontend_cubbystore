import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClipboardCopy, KeyRound, RotateCw, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  useRotateWebhookKey,
  useSaveWebhookSettings,
  useWebhookConfig,
} from '@/features/admin/config.api'

const Schema = z.object({
  amountRegex: z.string().min(1).max(500),
  expiryMinutes: z.number().int().min(1).max(240),
  randomMinDelta: z.number().min(-10).max(0),
  randomMaxDelta: z.number().min(0).max(10),
})
type FormValues = z.infer<typeof Schema>

export function AdminWebhookConfigPage() {
  const { data, isPending } = useWebhookConfig()
  const saveMut = useSaveWebhookSettings()
  const rotateMut = useRotateWebhookKey()
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<string[]>([])
  const [newKw, setNewKw] = useState('')
  const [testInput, setTestInput] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      amountRegex: '(\\d+\\.\\d{2})',
      expiryMinutes: 15,
      randomMinDelta: -0.99,
      randomMaxDelta: 0.99,
    },
  })

  useEffect(() => {
    if (data) {
      reset({
        amountRegex: data.amountRegex,
        expiryMinutes: data.expiryMinutes,
        randomMinDelta: Number(data.randomMinDelta),
        randomMaxDelta: Number(data.randomMaxDelta),
      })
      setKeywords(data.mustContain ?? [])
    }
  }, [data, reset])

  const currentRegex = watch('amountRegex')

  const onSave = async (v: FormValues) => {
    try {
      await saveMut.mutateAsync({
        mustContain: keywords,
        amountRegex: v.amountRegex,
        expiryMinutes: v.expiryMinutes,
        randomMinDelta: v.randomMinDelta,
        randomMaxDelta: v.randomMaxDelta,
      })
      toast.success('บันทึกแล้ว')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }

  const onRotate = async () => {
    if (!confirm('ออก API key ใหม่? key เดิมจะใช้งานไม่ได้ทันที')) return
    try {
      const res = await rotateMut.mutateAsync()
      setRevealedKey(res.plaintextKey)
      toast.success('สร้างคีย์ใหม่แล้ว — กรุณาคัดลอกตอนนี้ ระบบจะไม่แสดงอีก')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'rotate ไม่สำเร็จ')
    }
  }

  const addKeyword = () => {
    const trimmed = newKw.trim()
    if (!trimmed) return
    if (keywords.includes(trimmed)) return
    setKeywords([...keywords, trimmed])
    setNewKw('')
  }

  const testRegex = (() => {
    if (!testInput || !currentRegex) return null
    try {
      const m = new RegExp(currentRegex).exec(testInput)
      return m && m[1] ? m[1] : '(no match)'
    } catch {
      return '(invalid regex)'
    }
  })()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Webhook</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          API key + filter + regex ที่ใช้รับการแจ้งเตือนเงินเข้าจาก Tasker
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">API Key</CardTitle>
              <CardDescription>
                Tasker ต้องส่ง key นี้ใน header <code className="rounded bg-muted px-1 py-0.5 text-xs">X-API-Key</code>
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={onRotate} disabled={rotateMut.isPending}>
              <RotateCw className="mr-1 h-4 w-4" />
              {rotateMut.isPending ? 'กำลังสร้าง…' : 'สร้างคีย์ใหม่'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            {data ? (
              <>
                <span className="text-muted-foreground">ปลายคีย์ปัจจุบัน:</span>
                <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{data.apiKeyHint}</code>
              </>
            ) : (
              <span className="text-muted-foreground">ยังไม่ได้สร้างคีย์ — กดปุ่ม "สร้างคีย์ใหม่"</span>
            )}
          </div>
          {revealedKey && (
            <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm">
              <p className="mb-2 font-medium text-yellow-700 dark:text-yellow-300">
                คีย์เพิ่งสร้าง — บันทึกตอนนี้! ระบบจะไม่แสดงอีก
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded bg-muted px-2 py-1 font-mono text-xs">
                  {revealedKey}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await navigator.clipboard.writeText(revealedKey)
                    toast.success('คัดลอกแล้ว')
                  }}
                >
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          <div className="rounded-md bg-muted/50 p-3 text-xs">
            <p className="mb-1 font-medium">ตัวอย่าง POST:</p>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono">
{`POST /api/webhook/payment
X-API-Key: <key>
Content-Type: text/plain

ธ.กสิกร แจ้งเตือน: บัญชี xxx-x-x1234-x ได้รับโอน 100.37 บาท
จาก นาย สมชาย ใจดี เวลา 10:23`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {isPending ? (
        <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
      ) : (
        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">คำสำคัญที่ body ต้องมี</CardTitle>
              <CardDescription>
                ทุกคำต้องปรากฏใน body ถ้าขาดจะถูก reject และบันทึกเป็น <code>rejected_filter</code>
                {' '}ปล่อยว่างได้ถ้าไม่ต้อง filter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newKw}
                  onChange={(e) => setNewKw(e.target.value)}
                  placeholder="เช่น 'รับโอน', 'บัญชี xxx-x-x1234'"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addKeyword()
                    }
                  }}
                />
                <Button type="button" onClick={addKeyword}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.length === 0 && (
                  <p className="text-xs text-muted-foreground">ยังไม่มีคำกรอง</p>
                )}
                {keywords.map((k, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {k}
                    <button
                      type="button"
                      onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))}
                      aria-label="ลบ"
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regex จับยอดเงิน</CardTitle>
              <CardDescription>
                ต้องมี capture group แรก (parentheses) ที่จับเลขจำนวน — จุดทศนิยมใช้เป็นตัวคั่น (e.g. 100.37)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="amountRegex">Regex</Label>
                <Input id="amountRegex" {...register('amountRegex')} className="font-mono" />
                {errors.amountRegex && (
                  <p className="text-xs text-destructive">{errors.amountRegex.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="testInput">ทดลอง regex กับข้อความ</Label>
                <Input
                  id="testInput"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="วาง SMS ตัวอย่างที่นี่"
                />
                {testRegex !== null && (
                  <p className="text-xs">
                    จับได้:{' '}
                    <code className="rounded bg-muted px-2 py-0.5 font-mono">{testRegex}</code>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Random offset + expiry</CardTitle>
              <CardDescription>
                ยอดที่ลูกค้าต้องโอนจะเป็น base + random ในช่วงนี้ (ไม่ชนกับ pending อื่น)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="randomMinDelta">Min delta</Label>
                  <Input
                    id="randomMinDelta"
                    type="number"
                    step="0.01"
                    {...register('randomMinDelta', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="randomMaxDelta">Max delta</Label>
                  <Input
                    id="randomMaxDelta"
                    type="number"
                    step="0.01"
                    {...register('randomMaxDelta', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expiryMinutes">หมดอายุ (นาที)</Label>
                  <Input
                    id="expiryMinutes"
                    type="number"
                    min={1}
                    max={240}
                    {...register('expiryMinutes', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={saveMut.isPending || !data}>
            {saveMut.isPending ? 'กำลังบันทึก…' : 'บันทึกการตั้งค่า'}
          </Button>
        </form>
      )}
    </div>
  )
}
