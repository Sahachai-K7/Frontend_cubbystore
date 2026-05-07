import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AdminProduct } from '@/lib/types'

const LIST_KEY = ['admin', 'products'] as const
const detailKey = (id: string) => ['admin', 'products', id] as const

export type ProductFilters = {
  q?: string
  categoryId?: string
  active?: 'true' | 'false'
  lowStock?: 'true' | 'false'
  threshold?: number
}

export type AdminProductListItem = AdminProduct & { availableCount: number }

export function useAdminProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: [...LIST_KEY, filters] as const,
    queryFn: () => {
      const params = new URLSearchParams()
      if (filters.q) params.set('q', filters.q)
      if (filters.categoryId) params.set('categoryId', filters.categoryId)
      if (filters.active) params.set('active', filters.active)
      if (filters.lowStock) params.set('lowStock', filters.lowStock)
      if (filters.threshold !== undefined)
        params.set('threshold', String(filters.threshold))
      const qs = params.toString()
      return api
        .get<{ items: AdminProductListItem[] }>(`/api/admin/products${qs ? `?${qs}` : ''}`)
        .then((r) => r.items)
    },
  })
}

export function useAdminProduct(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: id ? detailKey(id) : ['admin', 'products', 'noop'],
    queryFn: () =>
      api
        .get<{ item: AdminProduct }>(`/api/admin/products/${id}`)
        .then((r) => r.item),
  })
}

export type ProductInput = {
  name: string
  slug?: string
  categoryId?: string | null
  description?: string | null
  price: number
  isActive?: boolean
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) =>
      api.post<{ item: AdminProduct }>('/api/admin/products', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<ProductInput>) =>
      api.patch<{ item: AdminProduct }>(`/api/admin/products/${id}`, patch),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: LIST_KEY })
      qc.invalidateQueries({ queryKey: detailKey(vars.id) })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del<{ ok: true }>(`/api/admin/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  })
}

export function useUploadProductImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData()
      fd.set('image', file)
      // Go through the shared api wrapper so backend error codes
      // (image_too_large, unsupported_image_type) surface as ApiError
      // with a structured body instead of a generic upload_failed:413.
      return api.putForm<{ item: AdminProduct }>(
        `/api/admin/products/${id}/image`,
        fd,
      )
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: LIST_KEY })
      qc.invalidateQueries({ queryKey: detailKey(vars.id) })
    },
  })
}

export function useDeleteProductImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.del<{ item: AdminProduct }>(`/api/admin/products/${id}/image`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: LIST_KEY })
      qc.invalidateQueries({ queryKey: detailKey(id) })
    },
  })
}
