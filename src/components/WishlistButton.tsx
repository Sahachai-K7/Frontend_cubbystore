import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  useAddWishlist,
  useRemoveWishlist,
  useWishlist,
} from '@/features/wishlist/wishlist.api'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

export function WishlistButton({
  productId,
  className,
  variant = 'icon',
}: {
  productId: string
  className?: string
  variant?: 'icon' | 'pill'
}) {
  const { data: session } = useSession()
  const { data } = useWishlist(!!session)
  const addMut = useAddWishlist()
  const removeMut = useRemoveWishlist()

  const inWishlist = data?.some((w) => w.productId === productId) ?? false

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!session) {
      toast.info('เข้าสู่ระบบเพื่อบันทึกสินค้า')
      return
    }
    try {
      if (inWishlist) {
        await removeMut.mutateAsync(productId)
        toast.success('ลบจากรายการแจ้งเตือนแล้ว')
      } else {
        await addMut.mutateAsync(productId)
        toast.success('จะแจ้งเตือนเมื่อมีของกลับมา')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สำเร็จ')
    }
  }

  if (variant === 'pill') {
    return (
      <Button
        type="button"
        variant={inWishlist ? 'default' : 'outline'}
        size="sm"
        onClick={onClick}
        disabled={addMut.isPending || removeMut.isPending}
        className={className}
      >
        <Heart
          className={cn(
            'mr-1 h-4 w-4',
            inWishlist && 'fill-current',
          )}
        />
        {inWishlist ? 'เก็บไว้แล้ว' : 'แจ้งเตือนเมื่อมีของ'}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={addMut.isPending || removeMut.isPending}
      aria-label={inWishlist ? 'นำออกจาก wishlist' : 'เพิ่มเข้า wishlist'}
      className={cn(
        'transition-colors',
        inWishlist && 'text-red-500 hover:text-red-600',
        className,
      )}
    >
      <Heart className={cn('h-5 w-5', inWishlist && 'fill-current')} />
    </Button>
  )
}
