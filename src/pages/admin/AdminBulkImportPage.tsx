import { useState } from 'react'
import { ChevronLeft, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import type { BulkImportResult } from '@/lib/types'

const SAMPLE = `[
  {
    "name": "ID ROV ระดับ Master",
    "slug": "rov-master",
    "categorySlug": "rov",
    "description": "พร้อมสกินหายาก",
    "price": 299,
    "isActive": true,
    "imageUrl": "https://images.k4ecubby.dev/products/abc.jpg",
    "payloads": [
      "acc1@example.com:pass1",
      "acc2@example.com:pass2"
    ]
  }
]`

export function AdminBulkImportPage() {
  const [json, setJson] = useState(SAMPLE)
  const [results, setResults] = useState<BulkImportResult[] | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const onSubmit = async () => {
    setParseError(null)
    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch (e) {
      setParseError('JSON ไม่ถูกต้อง — เช็ค syntax อีกครั้ง')
      return
    }
    if (!Array.isArray(parsed)) {
      setParseError('ต้องเป็น JSON array ของ object สินค้า')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post<{
        results: BulkImportResult[]
        summary: { submitted: number; created: number }
      }>('/api/admin/products/bulk', { items: parsed })
      setResults(res.results)
      toast.success(
        `สร้าง ${res.summary.created} / ${res.summary.submitted} สินค้า`,
      )
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ')
    } finally {
      setSubmitting(false)
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

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bulk import สินค้า
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          วาง JSON array ของสินค้า — สูงสุด 200 รายการต่อครั้ง
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">รูปแบบ</CardTitle>
          <CardDescription>
            แต่ละ object: <code>name</code> (required), <code>price</code> (required),
            <code> slug</code>, <code>categorySlug</code>, <code>description</code>,
            <code> isActive</code>, <code>imageUrl</code>, <code>payloads</code> (array
            of credentials)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={18}
            className="font-mono text-xs"
            spellCheck={false}
          />
          {parseError && (
            <p className="text-sm text-destructive">{parseError}</p>
          )}
          <div className="flex gap-2">
            <Button onClick={onSubmit} disabled={submitting}>
              <Upload className="mr-1 h-4 w-4" />
              {submitting ? 'กำลังอัปโหลด…' : 'Import'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setJson(SAMPLE)
                setResults(null)
                setParseError(null)
              }}
            >
              รีเซ็ตเป็นตัวอย่าง
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ผลลัพธ์</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2 text-sm"
                >
                  <Badge
                    variant={
                      r.status === 'created'
                        ? 'secondary'
                        : r.status === 'skipped'
                          ? 'outline'
                          : 'destructive'
                    }
                    className="shrink-0"
                  >
                    {r.status === 'created'
                      ? 'สำเร็จ'
                      : r.status === 'skipped'
                        ? 'ข้าม'
                        : 'ผิดพลาด'}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate">{r.name}</span>
                  {r.stockAdded !== undefined && r.stockAdded > 0 && (
                    <span className="text-xs text-muted-foreground">
                      +stock {r.stockAdded}
                    </span>
                  )}
                  {r.error && (
                    <span className="text-xs text-destructive">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
