import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AdminUserDetail, AdminUserRow, Paginated } from '@/lib/types'

export type UserFilters = {
  q?: string
  role?: 'user' | 'admin'
  page: number
  limit?: number
}

export function useAdminUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (filters.q) sp.set('q', filters.q)
      if (filters.role) sp.set('role', filters.role)
      if (filters.page > 1) sp.set('page', String(filters.page))
      if (filters.limit) sp.set('limit', String(filters.limit))
      const qs = sp.toString()
      return api.get<Paginated<AdminUserRow>>(
        `/api/admin/users${qs ? `?${qs}` : ''}`,
      )
    },
  })
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: id ? ['admin', 'users', id] : ['_'],
    queryFn: () => api.get<AdminUserDetail>(`/api/admin/users/${id}`),
  })
}

export function useChangeUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) =>
      api.patch<{ item: AdminUserRow }>(`/api/admin/users/${id}/role`, { role }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'users', vars.id] })
    },
  })
}

export function useAdjustWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      amount,
      note,
    }: {
      id: string
      amount: number
      note?: string
    }) =>
      api.post<{ ok: true; newBalance: string }>(
        `/api/admin/users/${id}/wallet-adjust`,
        { amount, note },
      ),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'users', vars.id] })
    },
  })
}
