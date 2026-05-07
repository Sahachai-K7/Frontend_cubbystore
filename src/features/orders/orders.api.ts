import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AdminOrderDetail,
  AdminOrderRow,
  Order,
  OrderDetail,
  Paginated,
} from '@/lib/types'

export function useMyOrders() {
  return useQuery({
    queryKey: ['me', 'orders'],
    queryFn: () =>
      api.get<{ items: Order[] }>('/api/me/orders').then((r) => r.items),
  })
}

export function useMyOrder(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: id ? ['me', 'orders', id] : ['_'],
    queryFn: () => api.get<OrderDetail>(`/api/me/orders/${id}`),
  })
}

export type AdminOrderFilters = {
  status?: 'paid' | 'delivered' | 'delivery_failed' | 'refunded'
  userId?: string
  q?: string
  from?: string
  to?: string
  page: number
  limit?: number
}

export function useAdminOrders(filters: AdminOrderFilters) {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (filters.status) sp.set('status', filters.status)
      if (filters.userId) sp.set('userId', filters.userId)
      if (filters.q) sp.set('q', filters.q)
      if (filters.from) sp.set('from', filters.from)
      if (filters.to) sp.set('to', filters.to)
      if (filters.page > 1) sp.set('page', String(filters.page))
      if (filters.limit) sp.set('limit', String(filters.limit))
      const qs = sp.toString()
      return api.get<Paginated<AdminOrderRow>>(
        `/api/admin/orders${qs ? `?${qs}` : ''}`,
      )
    },
  })
}

export function useAdminOrder(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: id ? ['admin', 'orders', id] : ['_'],
    queryFn: () => api.get<AdminOrderDetail>(`/api/admin/orders/${id}`),
  })
}

export function useResendDelivery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ ok: boolean }>(`/api/admin/orders/${id}/resend-delivery`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      qc.invalidateQueries({ queryKey: ['admin', 'orders', id] })
    },
  })
}

export function useRefundOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      restoreStock,
      reason,
    }: {
      id: string
      restoreStock?: boolean
      reason?: string
    }) =>
      api.post<{
        ok: boolean
        refundAmount: string
        newBalance: string
        restoredCount: number
      }>(`/api/admin/orders/${id}/refund`, { restoreStock, reason }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      qc.invalidateQueries({ queryKey: ['admin', 'orders', vars.id] })
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}
