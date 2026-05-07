import { useState } from 'react'
import { Search, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from '@/components/ui/responsive-table'
import { useAdminUsers } from '@/features/admin/users.api'
import { formatPriceTHB } from '@/lib/utils'
import type { AdminUserRow } from '@/lib/types'

const userColumns: ResponsiveTableColumn<AdminUserRow>[] = [
  {
    key: 'user',
    label: 'ผู้ใช้',
    render: (u) => (
      <span className="block">
        <span className="block font-medium">{u.name ?? '—'}</span>
        <span className="block text-xs text-muted-foreground">{u.email}</span>
      </span>
    ),
  },
  {
    key: 'role',
    label: 'Role',
    render: (u) =>
      u.role === 'admin' ? (
        <Badge className="gap-1">
          <Shield className="h-3 w-3" /> Admin
        </Badge>
      ) : (
        <Badge variant="secondary">User</Badge>
      ),
  },
  {
    key: 'orderCount',
    label: 'ออเดอร์',
    align: 'right',
    render: (u) => <span className="tabular-nums">{u.orderCount}</span>,
  },
  {
    key: 'totalSpent',
    label: 'ใช้รวม',
    align: 'right',
    render: (u) => (
      <span className="tabular-nums">{formatPriceTHB(u.totalSpent)}</span>
    ),
  },
  {
    key: 'walletBalance',
    label: 'กระเป๋า',
    align: 'right',
    render: (u) => (
      <span className="tabular-nums">{formatPriceTHB(u.walletBalance)}</span>
    ),
  },
  {
    key: 'createdAt',
    label: 'สมัคร',
    render: (u) => (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {new Date(u.createdAt).toLocaleDateString('th-TH')}
      </span>
    ),
  },
]

export function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [appliedQ, setAppliedQ] = useState('')
  const [role, setRole] = useState<'' | 'user' | 'admin'>('')
  const [page, setPage] = useState(1)

  const { data, isPending } = useAdminUsers({
    q: appliedQ || undefined,
    role: role || undefined,
    page,
    limit: 30,
  })
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setAppliedQ(searchInput.trim())
    setPage(1)
  }

  const hasFilters = !!(role || appliedQ)
  const clearAll = () => {
    setSearchInput('')
    setAppliedQ('')
    setRole('')
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ผู้ใช้</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ค้นด้วยอีเมล/ชื่อ — กดเข้าไปเพื่อดูออเดอร์, กระเป๋า, ปรับ role
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={onSearch} className="flex flex-col gap-2 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ค้น email หรือชื่อ"
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="outline" size="sm">
                ค้นหา
              </Button>
              <Select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as '' | 'user' | 'admin')
                  setPage(1)
                }}
                className="md:w-44"
              >
                <option value="">ทุก role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </Select>
              {hasFilters && (
                <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            {data ? `${data.total} ผู้ใช้` : '…'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ResponsiveTable
            data={data?.items}
            columns={userColumns}
            rowKey={(u) => u.id}
            rowHref={(u) => `/admin/users/${u.id}`}
            loading={isPending}
            emptyMessage="ไม่พบผู้ใช้"
          />
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ← ก่อนหน้า
          </Button>
          <span className="text-sm text-muted-foreground">
            หน้า {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            ถัดไป →
          </Button>
        </div>
      )}
    </div>
  )
}
