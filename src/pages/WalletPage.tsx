import { Link } from 'react-router-dom'
import { Plus, Receipt, Wallet as WalletIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from '@/components/ui/responsive-table'
import { useWallet } from '@/features/wallet/wallet.api'
import { cn, formatPriceTHB } from '@/lib/utils'
import type { WalletTransaction } from '@/lib/types'

const typeLabels: Record<string, string> = {
  topup: 'เติมเงิน',
  purchase: 'ซื้อสินค้า',
  refund: 'คืนเงิน',
  adjust: 'ปรับยอดโดยแอดมิน',
}

const txColumns: ResponsiveTableColumn<WalletTransaction>[] = [
  {
    key: 'type',
    label: 'ประเภท',
    render: (t) => {
      const positive = Number(t.amount) >= 0
      return (
        <span className="inline-flex flex-wrap items-center gap-2">
          <Badge variant={positive ? 'secondary' : 'outline'}>
            {typeLabels[t.type] ?? t.type}
          </Badge>
          {t.note && (
            <span className="text-xs text-muted-foreground">{t.note}</span>
          )}
        </span>
      )
    },
  },
  {
    key: 'createdAt',
    label: 'วันเวลา',
    render: (t) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {new Date(t.createdAt).toLocaleString('th-TH')}
      </span>
    ),
  },
  {
    key: 'amount',
    label: 'จำนวน',
    align: 'right',
    render: (t) => {
      const positive = Number(t.amount) >= 0
      return (
        <span
          className={cn(
            'font-medium tabular-nums',
            positive ? 'text-green-600' : 'text-destructive',
          )}
        >
          {positive ? '+' : ''}
          {formatPriceTHB(t.amount)}
        </span>
      )
    },
  },
  {
    key: 'balanceAfter',
    label: 'คงเหลือ',
    align: 'right',
    render: (t) => (
      <span className="tabular-nums text-muted-foreground">
        {formatPriceTHB(t.balanceAfter)}
      </span>
    ),
  },
]

export function WalletPage() {
  const { data, isPending } = useWallet()

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle>กระเป๋าเงินของฉัน</CardTitle>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
            <Link
              to="/orders"
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'w-full sm:w-auto',
              )}
            >
              <Receipt className="mr-1 h-4 w-4" /> ประวัติ
            </Link>
            <Link
              to="/wallet/topup"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'w-full sm:w-auto',
              )}
            >
              <Plus className="mr-1 h-4 w-4" /> เติมเงิน
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-6 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              ยอดเงินคงเหลือ
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">
              {isPending ? '…' : formatPriceTHB(data?.balance ?? '0')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">ประวัติรายการ</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveTable
            data={data?.transactions}
            columns={txColumns}
            rowKey={(t) => t.id}
            loading={isPending}
            emptyMessage="ยังไม่มีรายการ — เติมเงินเป็นรายการแรก"
          />
        </CardContent>
      </Card>
    </section>
  )
}
