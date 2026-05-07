import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Topup, TopupCreated, WalletInfo } from '@/lib/types'

const WALLET_KEY = ['me', 'wallet'] as const
const topupKey = (id: string) => ['me', 'topup', id] as const

export function useWallet(enabled = true) {
  return useQuery({
    enabled,
    queryKey: WALLET_KEY,
    queryFn: () => api.get<WalletInfo>('/api/me/wallet'),
  })
}

export function useCreateTopup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (amount: number) =>
      api
        .post<{ item: TopupCreated }>('/api/topups', { amount })
        .then((r) => r.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WALLET_KEY })
    },
  })
}

export function useTopupStatus(id: string | undefined) {
  const qc = useQueryClient()
  return useQuery({
    enabled: !!id,
    queryKey: id ? topupKey(id) : ['_'],
    queryFn: async () => {
      const r = await api.get<{ item: Topup }>(`/api/topups/${id}`)
      if (r.item.status === 'confirmed') {
        qc.invalidateQueries({ queryKey: WALLET_KEY })
      }
      return r.item
    },
    refetchInterval: (q) => {
      const status = q.state.data?.status
      return status === 'pending' ? 3000 : false
    },
  })
}
