import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from '@/components/ui/responsive-table'
import { useMyOrders } from '@/features/orders/orders.api'
import { formatPriceTHB } from '@/lib/utils'
import type { Order } from '@/lib/types'

const statusMeta: Record<
  Order['status'],
  { label: string; variant: 'secondary' | 'destructive' | 'outline' }
> = {
  paid: { label: 'จ่ายแล้ว', variant: 'outline' },
  delivered: { label: 'ส่งแล้ว', variant: 'secondary' },
  delivery_failed: { label: 'ส่งล้มเหลว', variant: 'destructive' },
  refunded: { label: 'คืนเงินแล้ว', variant: 'destructive' },
}

const columns: ResponsiveTableColumn<Order>[] = [
  {
    key: 'id',
    label: 'หมายเลข',
    render: (o) => (
      <span className="font-mono text-xs">{o.id.slice(0, 8)}</span>
    ),
  },
  {
    key: 'createdAt',
    label: 'วันที่',
    render: (o) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {new Date(o.createdAt).toLocaleString('th-TH')}
      </span>
    ),
  },
  {
    key: 'total',
    label: 'ยอด',
    align: 'right',
    render: (o) => (
      <span className="font-medium">{formatPriceTHB(o.total)}</span>
    ),
  },
  {
    key: 'status',
    label: 'สถานะ',
    render: (o) => (
      <Badge variant={statusMeta[o.status].variant}>
        {statusMeta[o.status].label}
      </Badge>
    ),
  },
]

export function OrdersPage() {
  const { data, isPending } = useMyOrders()

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        ประวัติคำสั่งซื้อ
      </h1>

      <Card>
        <CardContent className="p-0">
          <ResponsiveTable
            data={data}
            columns={columns}
            rowKey={(o) => o.id}
            rowHref={(o) => `/orders/${o.id}`}
            loading={isPending}
            emptyMessage="ยังไม่มีคำสั่งซื้อ"
          />
          {data && data.length === 0 && (
            <p className="border-t pb-6 pt-2 text-center text-sm">
              <Link to="/products" className="text-primary hover:underline">
                ไปเลือกสินค้า →
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
