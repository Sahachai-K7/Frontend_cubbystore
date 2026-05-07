import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Tag, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmailVerifyBanner } from '@/components/EmailVerifyBanner'
import {
  useCart,
  useCheckout,
  useRemoveCartItem,
  useUpdateCartQty,
} from '@/features/cart/cart.api'
import { useValidatePromo } from '@/features/admin/promo.api'
import { useWallet } from '@/features/wallet/wallet.api'
import { ApiError } from '@/lib/api'
import { resolveImageUrl } from '@/lib/env'
import { formatPriceTHB } from '@/lib/utils'
import type { PromoValidation } from '@/lib/types'

export function CartPage() {
  const navigate = useNavigate()
  const { data: cart, isPending } = useCart()
  const { data: wallet } = useWallet()
  const updateMut = useUpdateCartQty()
  const removeMut = useRemoveCartItem()
  const checkoutMut = useCheckout()
  const validatePromoMut = useValidatePromo()

  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<PromoValidation | null>(null)

  const balance = Number(wallet?.balance ?? 0)
  const subtotal = Number(cart?.total ?? 0)
  const discount = appliedPromo ? Number(appliedPromo.discount) : 0
  const total = Math.max(0, subtotal - discount)
  const insufficient = balance < total
  const empty = !cart || cart.items.length === 0

  const onApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoInput.trim()) return
    try {
      const res = await validatePromoMut.mutateAsync(promoInput.trim())
      setAppliedPromo(res)
      toast.success(`ใช้โค้ด ${res.code} ลด ${formatPriceTHB(res.discount)}`)
    } catch (err: unknown) {
      const code =
        err instanceof ApiError && err.body && typeof err.body === 'object' && 'error' in err.body
          ? String((err.body as { error: unknown }).error)
          : null
      const map: Record<string, string> = {
        not_found: 'ไม่พบโค้ดนี้',
        inactive: 'โค้ดนี้ปิดใช้งาน',
        expired: 'โค้ดหมดอายุแล้ว',
        used_up: 'โค้ดถูกใช้ครบจำนวนแล้ว',
        min_total_not_met: 'ยอดในตะกร้าไม่ถึงขั้นต่ำที่กำหนด',
        cart_empty: 'ตะกร้าว่าง',
      }
      toast.error(map[code ?? ''] ?? 'ใช้โค้ดไม่ได้')
      setAppliedPromo(null)
    }
  }

  const onCheckout = async () => {
    try {
      const res = await checkoutMut.mutateAsync(
        appliedPromo ? { promoCode: appliedPromo.code } : undefined,
      )
      toast.success('สั่งซื้อสำเร็จ — ส่งสินค้าทาง email แล้ว')
      navigate(`/orders/${res.orderId}`)
    } catch (e: unknown) {
      const err = e instanceof ApiError ? (e.body as { error?: string; detail?: unknown }) : null
      const msg: Record<string, string> = {
        cart_empty: 'ตะกร้าว่าง',
        product_inactive: 'มีสินค้าในตะกร้าที่ปิดขายแล้ว',
        insufficient_stock: 'ของในคลังไม่พอ — กรุณาลดจำนวนหรือลบรายการ',
        insufficient_balance: 'ยอดเงินในกระเป๋าไม่พอ — กรุณาเติมก่อน',
        invalid_promo: 'โค้ดส่วนลดใช้ไม่ได้แล้ว',
        email_not_verified:
          'กรุณายืนยันอีเมลของคุณก่อน — ตรวจกล่องขาเข้าหรือกดส่งใหม่ในแบนเนอร์ด้านบน',
      }
      toast.error(
        msg[err?.error ?? ''] ?? (e instanceof Error ? e.message : 'checkout ไม่สำเร็จ'),
      )
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">ตะกร้า</h1>

      <EmailVerifyBanner className="mb-6" />

      {isPending && (
        <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
      )}

      {!isPending && empty && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ตะกร้าว่างเปล่า</p>
            <Link to="/products" className="text-sm text-primary hover:underline">
              ไปเลือกสินค้า →
            </Link>
          </CardContent>
        </Card>
      )}

      {cart && cart.items.length > 0 && (
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {cart.items.map((line) => {
                  const overStock = line.qty > line.availableCount
                  return (
                    <div key={line.productId} className="flex gap-3 p-3">
                      {line.imageUrl ? (
                        <img
                          src={resolveImageUrl(line.imageUrl)}
                          alt=""
                          className="h-20 w-20 rounded object-cover"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded bg-muted/30" />
                      )}
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/products/${line.slug}`}
                          className="line-clamp-2 text-sm font-medium hover:underline"
                        >
                          {line.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {formatPriceTHB(line.price)} / รายการ
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-0.5 rounded-md border">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              disabled={updateMut.isPending}
                              onClick={() =>
                                updateMut.mutate({
                                  productId: line.productId,
                                  qty: Math.max(0, line.qty - 1),
                                })
                              }
                              aria-label="ลด"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="min-w-8 text-center text-sm font-medium">
                              {line.qty}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              disabled={
                                updateMut.isPending || line.qty >= line.availableCount
                              }
                              onClick={() =>
                                updateMut.mutate({
                                  productId: line.productId,
                                  qty: line.qty + 1,
                                })
                              }
                              aria-label="เพิ่ม"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={removeMut.isPending}
                            onClick={() => removeMut.mutate(line.productId)}
                            aria-label="ลบ"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          {!line.isActive && (
                            <Badge variant="destructive">ปิดขายแล้ว</Badge>
                          )}
                          {overStock && (
                            <Badge variant="destructive">
                              เหลือ {line.availableCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm font-semibold">
                        {formatPriceTHB(Number(line.price) * line.qty)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="self-start md:sticky md:top-20">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">จำนวน</span>
                <span>{cart.count} รายการ</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ยอดสินค้า</span>
                <span className="tabular-nums">{formatPriceTHB(cart.total)}</span>
              </div>

              {appliedPromo ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-sm">
                  <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-emerald-700 dark:text-emerald-400">
                    <Tag className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate font-mono text-xs font-semibold">
                      {appliedPromo.code}
                    </span>
                    <span className="shrink-0 text-xs">
                      −{formatPriceTHB(appliedPromo.discount)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setAppliedPromo(null)}
                    aria-label="ยกเลิกโค้ด"
                    className="shrink-0 text-emerald-700/70 hover:text-emerald-700 dark:text-emerald-400/70 dark:hover:text-emerald-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={onApplyPromo} className="flex gap-2">
                  <Input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="ใส่โค้ดส่วนลด"
                    className="font-mono text-xs"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={validatePromoMut.isPending || !promoInput.trim()}
                  >
                    ใช้
                  </Button>
                </form>
              )}

              <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
                <span>ยอดรวมสุทธิ</span>
                <span className="tabular-nums">{formatPriceTHB(total.toFixed(2))}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>ยอดในกระเป๋า</span>
                <span className="tabular-nums">{formatPriceTHB(wallet?.balance ?? '0')}</span>
              </div>
              {insufficient && (
                <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
                  ยอดเงินไม่พอ — เติมเพิ่มอีก {formatPriceTHB(total - balance)}
                </div>
              )}
              <Button
                className="w-full"
                size="lg"
                disabled={checkoutMut.isPending || empty || insufficient}
                onClick={onCheckout}
              >
                {checkoutMut.isPending
                  ? 'กำลังประมวลผล…'
                  : insufficient
                    ? 'ยอดในกระเป๋าไม่พอ'
                    : 'ยืนยันการชำระเงิน'}
              </Button>
              {insufficient && (
                <Link
                  to="/wallet/topup"
                  className="block text-center text-sm text-primary hover:underline"
                >
                  เติมเงินเพิ่ม →
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  )
}
