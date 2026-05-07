import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Category,
  Paginated,
  ProductDetail,
  ProductListItem,
} from '@/lib/types'

export type SortKey = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular'

export type ProductListParams = {
  categorySlug?: string
  q?: string
  sort?: SortKey
  page?: number
  limit?: number
}

function buildQuery(p: ProductListParams): string {
  const sp = new URLSearchParams()
  if (p.categorySlug) sp.set('categorySlug', p.categorySlug)
  if (p.q) sp.set('q', p.q)
  if (p.sort) sp.set('sort', p.sort)
  if (p.page && p.page > 1) sp.set('page', String(p.page))
  if (p.limit) sp.set('limit', String(p.limit))
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export function usePublicCategories() {
  return useQuery({
    queryKey: ['public', 'categories'],
    queryFn: () =>
      api.get<{ items: Category[] }>('/api/categories').then((r) => r.items),
    staleTime: 60_000,
  })
}

export function usePublicProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ['public', 'products', params],
    queryFn: () =>
      api.get<Paginated<ProductListItem>>(`/api/products${buildQuery(params)}`),
  })
}

export function usePublicProduct(slug: string | undefined) {
  return useQuery({
    enabled: !!slug,
    queryKey: ['public', 'products', slug],
    queryFn: () =>
      api.get<{ item: ProductDetail }>(`/api/products/${slug}`).then((r) => r.item),
  })
}
