import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { WishlistItem } from '@/lib/types'

const KEY = ['me', 'wishlist'] as const

export function useWishlist(enabled = true) {
  return useQuery({
    enabled,
    queryKey: KEY,
    queryFn: () =>
      api.get<{ items: WishlistItem[] }>('/api/me/wishlist').then((r) => r.items),
  })
}

export function useAddWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) =>
      api.post<{ ok: true }>('/api/me/wishlist', { productId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useRemoveWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) =>
      api.del<{ ok: true }>(`/api/me/wishlist/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
