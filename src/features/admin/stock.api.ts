import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { StockItem } from '@/lib/types'

const listKey = (productId: string, status?: 'available' | 'sold') =>
  ['admin', 'products', productId, 'stock', status ?? 'all'] as const
const summaryKey = (productId: string) =>
  ['admin', 'products', productId, 'stock', 'summary'] as const

export function useStockSummary(productId: string | undefined) {
  return useQuery({
    enabled: !!productId,
    queryKey: productId ? summaryKey(productId) : ['_'],
    queryFn: () =>
      api.get<{ available: number; sold: number }>(
        `/api/admin/products/${productId}/stock/summary`,
      ),
  })
}

export function useStockList(
  productId: string | undefined,
  status?: 'available' | 'sold',
) {
  return useQuery({
    enabled: !!productId,
    queryKey: productId ? listKey(productId, status) : ['_'],
    queryFn: () => {
      const qs = status ? `?status=${status}` : ''
      return api
        .get<{ items: StockItem[] }>(`/api/admin/products/${productId}/stock${qs}`)
        .then((r) => r.items)
    },
  })
}

export function useBulkAddStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, payloads }: { productId: string; payloads: string }) =>
      api.post<{ added: number }>(`/api/admin/products/${productId}/stock`, {
        payloads,
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ['admin', 'products', vars.productId, 'stock'],
      })
    },
  })
}

export function useDeleteStockItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, stockId }: { productId: string; stockId: string }) =>
      api.del<{ ok: true }>(`/api/admin/products/${productId}/stock/${stockId}`),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ['admin', 'products', vars.productId, 'stock'],
      })
    },
  })
}
