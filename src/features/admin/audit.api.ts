import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AuditLogRow, Paginated } from '@/lib/types'

export type AuditFilters = {
  adminId?: string
  action?: string
  target?: string
  from?: string
  to?: string
  page: number
  limit?: number
}

export function useAuditLog(filters: AuditFilters) {
  return useQuery({
    queryKey: ['admin', 'audit-log', filters],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (filters.adminId) sp.set('adminId', filters.adminId)
      if (filters.action) sp.set('action', filters.action)
      if (filters.target) sp.set('target', filters.target)
      if (filters.from) sp.set('from', filters.from)
      if (filters.to) sp.set('to', filters.to)
      if (filters.page > 1) sp.set('page', String(filters.page))
      if (filters.limit) sp.set('limit', String(filters.limit))
      const qs = sp.toString()
      return api.get<Paginated<AuditLogRow>>(
        `/api/admin/audit-log${qs ? `?${qs}` : ''}`,
      )
    },
  })
}
