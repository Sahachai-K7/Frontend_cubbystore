import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PromoCode, PromoValidation } from '@/lib/types'

const ADMIN_KEY = ['admin', 'promo-codes'] as const

export function useAdminPromos(filter?: 'all' | 'active' | 'inactive') {
  return useQuery({
    queryKey: [...ADMIN_KEY, filter] as const,
    queryFn: () => {
      const sp = new URLSearchParams()
      if (filter === 'active') sp.set('active', 'true')
      if (filter === 'inactive') sp.set('active', 'false')
      const qs = sp.toString()
      return api
        .get<{ items: PromoCode[] }>(
          `/api/admin/promo-codes${qs ? `?${qs}` : ''}`,
        )
        .then((r) => r.items)
    },
  })
}

export type PromoInput = {
  code: string
  type: 'percent' | 'amount'
  value: number
  minTotal?: number | null
  maxUses?: number | null
  expiresAt?: string | null
  isActive?: boolean
  note?: string | null
}

export function useCreatePromo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PromoInput) =>
      api.post<{ item: PromoCode }>('/api/admin/promo-codes', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEY }),
  })
}

export function useUpdatePromo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<PromoInput>) =>
      api.patch<{ item: PromoCode }>(`/api/admin/promo-codes/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEY }),
  })
}

export function useDeletePromo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/admin/promo-codes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEY }),
  })
}

export function useValidatePromo() {
  return useMutation({
    mutationFn: (code: string) =>
      api.post<PromoValidation>('/api/me/promo/validate', { code }),
  })
}
