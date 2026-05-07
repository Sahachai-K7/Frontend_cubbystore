import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AdminReviewRow,
  Paginated,
  Review,
  ReviewSummary,
  ReviewableItem,
} from '@/lib/types'

const productKey = (slug: string, page: number) =>
  ['reviews', 'product', slug, page] as const
const REVIEWABLE_KEY = ['me', 'reviewable'] as const

export function useProductReviews(slug: string | undefined, page = 1) {
  return useQuery({
    enabled: !!slug,
    queryKey: slug ? productKey(slug, page) : ['_'],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (page > 1) sp.set('page', String(page))
      const qs = sp.toString()
      return api.get<Paginated<Review> & { summary: ReviewSummary }>(
        `/api/products/${slug}/reviews${qs ? `?${qs}` : ''}`,
      )
    },
  })
}

export function useReviewable(enabled = true) {
  return useQuery({
    enabled,
    queryKey: REVIEWABLE_KEY,
    queryFn: () =>
      api.get<{ items: ReviewableItem[] }>('/api/me/reviewable').then((r) => r.items),
  })
}

export type ReviewCreateInput = {
  orderItemId: string
  rating: number
  comment?: string | null
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ReviewCreateInput) =>
      api.post<{ item: { id: string; productId: string } }>(
        '/api/me/reviews',
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REVIEWABLE_KEY })
      qc.invalidateQueries({ queryKey: ['reviews'] })
      qc.invalidateQueries({ queryKey: ['public', 'products'] })
    },
  })
}

export function useAdminReviews(filters: {
  productId?: string
  deleted?: 'true' | 'false'
  page: number
}) {
  return useQuery({
    queryKey: ['admin', 'reviews', filters],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (filters.productId) sp.set('productId', filters.productId)
      if (filters.deleted) sp.set('deleted', filters.deleted)
      if (filters.page > 1) sp.set('page', String(filters.page))
      const qs = sp.toString()
      return api.get<Paginated<AdminReviewRow>>(
        `/api/admin/reviews${qs ? `?${qs}` : ''}`,
      )
    },
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/admin/reviews/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  })
}

export function useRestoreReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.post(`/api/admin/reviews/${id}/restore`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  })
}
