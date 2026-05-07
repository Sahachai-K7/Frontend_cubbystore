import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export type ResponsiveTableColumn<T> = {
  key: string
  label: string
  render: (row: T) => React.ReactNode
  align?: 'left' | 'right' | 'center'
  /** Tailwind classes applied to the desktop <td> cell */
  className?: string
  /** Hide this column entirely on mobile (still shown on desktop) */
  hideOnMobile?: boolean
}

export function ResponsiveTable<T>({
  data,
  columns,
  rowKey,
  rowHref,
  emptyMessage = 'ไม่มีรายการ',
  loading = false,
  loadingMessage = 'กำลังโหลด…',
}: {
  data: T[] | undefined
  columns: ResponsiveTableColumn<T>[]
  rowKey: (row: T) => string
  /** When set, mobile cards become clickable links AND desktop rows show a hover state */
  rowHref?: (row: T) => string
  emptyMessage?: string
  loading?: boolean
  loadingMessage?: string
}) {
  if (loading) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        {loadingMessage}
      </p>
    )
  }
  if (!data) return null
  if (data.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <>
      <MobileCards
        data={data}
        columns={columns}
        rowKey={rowKey}
        rowHref={rowHref}
      />
      <DesktopTable
        data={data}
        columns={columns}
        rowKey={rowKey}
        rowHref={rowHref}
      />
    </>
  )
}

function MobileCards<T>({
  data,
  columns,
  rowKey,
  rowHref,
}: {
  data: T[]
  columns: ResponsiveTableColumn<T>[]
  rowKey: (row: T) => string
  rowHref?: (row: T) => string
}) {
  const visible = columns.filter((c) => !c.hideOnMobile)
  const [first, ...rest] = visible

  return (
    <ul className="divide-y md:hidden">
      {data.map((row) => {
        const card = (
          <div className="space-y-2 px-4 py-3">
            {first && (
              <div className="text-base font-medium text-foreground">
                {first.render(row)}
              </div>
            )}
            {rest.length > 0 && (
              <dl className="space-y-1 text-sm">
                {rest.map((c) => (
                  <div
                    key={c.key}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                      {c.label}
                    </dt>
                    <dd className="min-w-0 text-right">{c.render(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )
        return (
          <li key={rowKey(row)}>
            {rowHref ? (
              <Link
                to={rowHref(row)}
                className="block transition-colors hover:bg-accent/50"
              >
                {card}
              </Link>
            ) : (
              card
            )}
          </li>
        )
      })}
    </ul>
  )
}

function DesktopTable<T>({
  data,
  columns,
  rowKey,
  rowHref,
}: {
  data: T[]
  columns: ResponsiveTableColumn<T>[]
  rowKey: (row: T) => string
  rowHref?: (row: T) => string
}) {
  const navigate = useNavigate()
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn('px-3 py-2 font-medium', alignClass(c.align))}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const href = rowHref?.(row)
            return (
              <tr
                key={rowKey(row)}
                className={cn(
                  'border-b last:border-0',
                  href && 'cursor-pointer transition-colors hover:bg-accent/30',
                )}
                onClick={
                  href
                    ? (e) => {
                        const target = e.target as HTMLElement
                        if (
                          target.closest(
                            'a,button,input,select,textarea,label,[role="button"]',
                          )
                        )
                          return
                        if (e.metaKey || e.ctrlKey || e.button === 1) {
                          window.open(href, '_blank')
                        } else {
                          navigate(href)
                        }
                      }
                    : undefined
                }
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'px-3 py-2 align-middle',
                      alignClass(c.align),
                      c.className,
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function alignClass(a?: 'left' | 'right' | 'center') {
  if (a === 'right') return 'text-right'
  if (a === 'center') return 'text-center'
  return ''
}
