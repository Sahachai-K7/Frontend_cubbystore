import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  useStockSummary,
  useStockList,
  useBulkAddStock,
  useDeleteStockItem,
} from '@/features/admin/stock.api'

export function ProductStockManager({ productId }: { productId: string }) {
  const summary = useStockSummary(productId)
  const [tab, setTab] = useState<'available' | 'sold'>('available')
  const list = useStockList(productId, tab)
  const [paste, setPaste] = useState('')
  const bulkMut = useBulkAddStock()
  const delMut = useDeleteStockItem()

  const onBulkAdd = async () => {
    const trimmed = paste.trim()
    if (!trimmed) return
    try {
      const r = await bulkMut.mutateAsync({ productId, payloads: trimmed })
      toast.success(`เพิ่มของในคลัง ${r.added} รายการ`)
      setPaste('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'เพิ่มไม่สำเร็จ')
    }
  }

  const onDelete = async (stockId: string) => {
    if (!confirm('ลบรายการนี้?')) return
    try {
      await delMut.mutateAsync({ productId, stockId })
      toast.success('ลบแล้ว')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
    }
  }

  const lineCount = paste.split(/\r?\n/).filter((s) => s.trim().length > 0).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-end justify-between">
          <div>
            <CardTitle className="text-base">คลังสินค้า (Stock Pool)</CardTitle>
            <CardDescription>
              1 บรรทัด = 1 รายการที่จะส่งให้ลูกค้าทาง email
            </CardDescription>
          </div>
          <div className="flex gap-2 text-sm">
            <Badge variant="secondary">พร้อมขาย {summary.data?.available ?? '…'}</Badge>
            <Badge variant="outline">ขายแล้ว {summary.data?.sold ?? '…'}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={6}
            placeholder={'user1@example.com:pass123\nuser2@example.com:pass456'}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{lineCount} บรรทัดที่จะเพิ่ม</span>
            <Button
              size="sm"
              onClick={onBulkAdd}
              disabled={bulkMut.isPending || lineCount === 0}
            >
              <Plus className="mr-1 h-4 w-4" />
              {bulkMut.isPending ? 'กำลังเพิ่ม…' : `เพิ่ม ${lineCount} รายการ`}
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-2 flex gap-2">
            <Button
              size="sm"
              variant={tab === 'available' ? 'default' : 'outline'}
              onClick={() => setTab('available')}
            >
              พร้อมขาย
            </Button>
            <Button
              size="sm"
              variant={tab === 'sold' ? 'default' : 'outline'}
              onClick={() => setTab('sold')}
            >
              ขายแล้ว
            </Button>
          </div>

          {list.isPending && <p className="text-sm text-muted-foreground">กำลังโหลด…</p>}
          {list.data && list.data.length === 0 && (
            <p className="text-sm text-muted-foreground">— ไม่มีรายการ —</p>
          )}
          {list.data && list.data.length > 0 && (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <tbody>
                  {list.data.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-mono text-xs break-all">
                        {item.payload}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {item.status === 'available' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(item.id)}
                            aria-label="ลบ"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {item.soldAt
                              ? new Date(item.soldAt).toLocaleString('th-TH')
                              : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
