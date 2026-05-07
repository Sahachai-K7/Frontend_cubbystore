import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Mail,
  Package,
  Receipt,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SalesChart } from '@/components/SalesChart'
import { useDashboard } from '@/features/admin/dashboard.api'
import { formatPriceTHB } from '@/lib/utils'

export function AdminDashboardPage() {
  const { data, isPending } = useDashboard()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ภาพรวม</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          สรุปสถานะร้านวันนี้ — ตัวเลขอัปเดตทุกครั้งที่เข้าหน้านี้
        </p>
      </div>

      {isPending && (
        <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
      )}

      {data && (
        <>
          {/* Sales row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Kpi
              label="ยอดขายวันนี้"
              value={formatPriceTHB(data.sales.today.total)}
              hint={`${data.sales.today.count} ออเดอร์`}
              icon={TrendingUp}
              tone="primary"
            />
            <Kpi
              label="ยอดขาย 7 วัน"
              value={formatPriceTHB(data.sales.last7d.total)}
              hint={`${data.sales.last7d.count} ออเดอร์`}
              icon={TrendingUp}
            />
            <Kpi
              label="ยอดขาย 30 วัน"
              value={formatPriceTHB(data.sales.last30d.total)}
              hint={`${data.sales.last30d.count} ออเดอร์`}
              icon={TrendingUp}
            />
          </div>

          {/* Operational row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              label="รอจ่าย / รอส่ง"
              value={String(data.orders.paid)}
              hint="paid"
              icon={Receipt}
              tone={data.orders.paid > 0 ? 'warn' : undefined}
              href="/admin/orders?status=paid"
            />
            <Kpi
              label="ส่งล้มเหลว"
              value={String(data.orders.deliveryFailed)}
              hint="ต้อง resend"
              icon={Mail}
              tone={data.orders.deliveryFailed > 0 ? 'danger' : undefined}
              href="/admin/orders?status=delivery_failed"
            />
            <Kpi
              label="สมาชิกใหม่ 24 ชม."
              value={String(data.users.newLast24h)}
              icon={UserPlus}
              href="/admin/users"
            />
            <Kpi
              label="Stock ใกล้หมด"
              value={String(data.stock.lowCount)}
              hint="< 5 ชิ้น"
              icon={AlertTriangle}
              tone={data.stock.lowCount > 0 ? 'warn' : undefined}
              href="/admin/products?lowStock=true"
            />
          </div>

          {/* Finance row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Kpi
              label="Top-up รอจ่าย"
              value={String(data.topups.pendingCount)}
              hint={`รวม ${formatPriceTHB(data.topups.pendingTotal)}`}
              icon={Wallet}
            />
            <Kpi
              label="กระเป๋าลูกค้ารวม"
              value={formatPriceTHB(data.walletLiability)}
              hint="liability ของร้าน"
              icon={Boxes}
            />
            <Kpi
              label="ส่งสำเร็จทั้งหมด"
              value={String(data.orders.delivered)}
              hint="orders"
              icon={Package}
            />
          </div>

          {/* Sales chart */}
          <SalesChart />

          {/* Lists row */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>ขายดี 30 วันล่าสุด</span>
                  <Badge variant="outline" className="text-[10px]">
                    Top {data.topSellers.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {data.topSellers.length === 0 ? (
                  <p className="px-6 pb-6 text-sm text-muted-foreground">— ยังไม่มียอดขาย —</p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {data.topSellers.map((p) => (
                        <tr key={p.productId} className="border-b last:border-0">
                          <td className="px-4 py-2">
                            {p.slug ? (
                              <Link
                                to={`/admin/products/${p.productId}`}
                                className="hover:underline"
                              >
                                {p.name ?? p.productId}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">{p.name ?? '—'}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-xs">
                            {p.qtySold} ชิ้น
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {formatPriceTHB(p.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>Stock ใกล้หมด</span>
                  <Link
                    to="/admin/products?lowStock=true"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ดูทั้งหมด <ArrowRight className="inline h-3 w-3" />
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {data.stock.topLow.length === 0 ? (
                  <p className="px-6 pb-6 text-sm text-muted-foreground">
                    — ทุกอย่างเรียบร้อย —
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {data.stock.topLow.map((p) => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="px-4 py-2">
                            <Link
                              to={`/admin/products/${p.id}`}
                              className="hover:underline"
                            >
                              {p.name}
                            </Link>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className="text-xs text-muted-foreground">
                              ขายแล้ว {p.soldCount}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Badge variant={p.available === 0 ? 'destructive' : 'outline'}>
                              เหลือ {p.available}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  href,
}: {
  label: string
  value: string
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  tone?: 'primary' | 'warn' | 'danger'
  href?: string
}) {
  const toneCls =
    tone === 'primary'
      ? 'border-primary/30 bg-primary/5'
      : tone === 'warn'
        ? 'border-amber-500/30 bg-amber-500/5'
        : tone === 'danger'
          ? 'border-destructive/30 bg-destructive/5'
          : ''

  const inner = (
    <Card
      className={`flex h-full flex-col ${toneCls} transition-colors ${href ? 'hover:border-foreground/30' : ''}`}
    >
      <CardContent className="flex h-full flex-col p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint ?? ' '}</p>
      </CardContent>
    </Card>
  )

  return href ? (
    <Link to={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  )
}
