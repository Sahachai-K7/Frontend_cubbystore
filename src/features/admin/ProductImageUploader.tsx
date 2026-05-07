import { useEffect, useRef, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useUploadProductImage,
  useDeleteProductImage,
} from '@/features/admin/products.api'
import { resolveImageUrl } from '@/lib/env'
import { ApiError } from '@/lib/api'
import type { AdminProduct } from '@/lib/types'

const UPLOAD_ERROR_LABEL: Record<string, string> = {
  image_too_large: 'ไฟล์ใหญ่เกิน 2MB',
  unsupported_image_type: 'รองรับเฉพาะ JPG / PNG / WebP',
  s3_storage_not_configured: 'ระบบเก็บรูปยังไม่พร้อม — แจ้งผู้ดูแล',
}

export function ProductImageUploader({ product }: { product: AdminProduct }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const uploadMut = useUploadProductImage()
  const deleteMut = useDeleteProductImage()

  // Free the previous blob URL when the preview changes / component unmounts.
  // Otherwise each pick leaks until the page is closed.
  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  const onPick = async (file: File) => {
    setPreview(URL.createObjectURL(file))
    try {
      await uploadMut.mutateAsync({ id: product.id, file })
      toast.success('อัปโหลดรูปแล้ว')
    } catch (err: unknown) {
      const code =
        err instanceof ApiError &&
        err.body &&
        typeof err.body === 'object' &&
        'error' in err.body
          ? String((err.body as { error: unknown }).error).split(':')[0]
          : null
      toast.error(
        (code && UPLOAD_ERROR_LABEL[code ?? '']) ??
          (err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ'),
      )
    } finally {
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onRemove = async () => {
    if (!confirm('ลบรูปสินค้านี้?')) return
    try {
      await deleteMut.mutateAsync(product.id)
      toast.success('ลบรูปแล้ว')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ลบรูปไม่สำเร็จ')
    }
  }

  const currentSrc = preview ?? (product.imageUrl ? resolveImageUrl(product.imageUrl) : null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">รูปสินค้า</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        <div className="h-40 w-40 overflow-hidden rounded-md border bg-muted/30">
          {currentSrc ? (
            <img src={currentSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              ยังไม่มีรูป
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            JPEG / PNG / WEBP ขนาดไม่เกิน 2MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onPick(f)
            }}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploadMut.isPending}
            >
              <Upload className="mr-1 h-4 w-4" />
              {uploadMut.isPending ? 'กำลังอัปโหลด…' : 'เลือกรูป'}
            </Button>
            {product.imageUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRemove}
                disabled={deleteMut.isPending}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                ลบรูป
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
