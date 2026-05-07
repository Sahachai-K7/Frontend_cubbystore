import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CartView } from '@/lib/types'

const CART_KEY = ['me', 'cart'] as const

export function useCart(enabled = true) {
  return useQuery({
    enabled,
    queryKey: CART_KEY,
    queryFn: () => api.get<CartView>('/api/me/cart'),
  })
}

export function useAddToCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, qty = 1 }: { productId: string; qty?: number }) =>
      api.post<CartView>('/api/me/cart', { productId, qty }),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  })
}

export function useUpdateCartQty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, qty }: { productId: string; qty: number }) =>
      api.patch<CartView>(`/api/me/cart/${productId}`, { qty }),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  })
}

export function useRemoveCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => api.del<CartView>(`/api/me/cart/${productId}`),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  })
}

export function useCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input?: { promoCode?: string }) =>
      api.post<{
        orderId: string
        subtotal: string
        discount: string
        total: string
        balanceAfter: string
        itemsCount: number
        promoCode: string | null
      }>('/api/me/checkout', input),
    onSuccess: () => {
      qc.setQueryData(CART_KEY, { items: [], total: '0.00', count: 0 })
      qc.invalidateQueries({ queryKey: ['me', 'wallet'] })
      qc.invalidateQueries({ queryKey: ['me', 'orders'] })
    },
  })
}
