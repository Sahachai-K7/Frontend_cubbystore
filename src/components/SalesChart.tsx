import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPriceTHB } from '@/lib/utils'
import type { SalesChartDay } from '@/lib/types'

export function SalesChart() {
  const { data, isPending } = useQuery({
    queryKey: ['admin', 'sales-chart', 30],
    queryFn: () =>
      api
        .get<{ days: SalesChartDay[] }>('/api/admin/dashboard/sales-chart?days=30')
        .then((r) => r.days),
    staleTime: 60_000,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ยอดขาย 30 วันล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        {isPending && (
          <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
        )}
        {data && <Chart days={data} />}
      </CardContent>
    </Card>
  )
}

function Chart({ days }: { days: SalesChartDay[] }) {
  const W = 600
  const H = 180
  const padL = 8
  const padR = 8
  const padT = 8
  const padB = 24

  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const values = days.map((d) => Number(d.revenue))
  const maxV = Math.max(1, ...values)
  const totalRevenue = values.reduce((s, v) => s + v, 0)
  const totalCount = days.reduce((s, d) => s + d.count, 0)

  const x = (i: number) =>
    days.length === 1 ? padL + innerW / 2 : padL + (i * innerW) / (days.length - 1)
  const y = (v: number) => padT + innerH - (v / maxV) * innerH

  const linePath = days
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(Number(d.revenue)).toFixed(1)}`)
    .join(' ')

  const areaPath =
    `M${padL.toFixed(1)} ${(padT + innerH).toFixed(1)} ` +
    days
      .map(
        (d, i) =>
          `L${x(i).toFixed(1)} ${y(Number(d.revenue)).toFixed(1)}`,
      )
      .join(' ') +
    ` L${(padL + innerW).toFixed(1)} ${(padT + innerH).toFixed(1)} Z`

  const firstDate = days[0]?.date
  const lastDate = days[days.length - 1]?.date

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            รายได้รวม
          </p>
          <p className="mt-0.5 text-2xl font-semibold tabular-nums">
            {formatPriceTHB(totalRevenue)}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{totalCount} ออเดอร์</p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-44 w-full"
        role="img"
        aria-label="Sales chart"
      >
        <defs>
          <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="text-primary">
          <path d={areaPath} fill="url(#salesArea)" />
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {days.map((d, i) => (
            <g key={d.date}>
              <circle
                cx={x(i)}
                cy={y(Number(d.revenue))}
                r="2"
                fill="currentColor"
              />
              <title>
                {d.date}: {formatPriceTHB(d.revenue)} · {d.count} ออเดอร์
              </title>
            </g>
          ))}
        </g>
        <text
          x={padL}
          y={H - 6}
          className="fill-muted-foreground text-[10px]"
          fontSize="10"
        >
          {firstDate}
        </text>
        <text
          x={W - padR}
          y={H - 6}
          textAnchor="end"
          className="fill-muted-foreground text-[10px]"
          fontSize="10"
        >
          {lastDate}
        </text>
      </svg>
    </div>
  )
}
