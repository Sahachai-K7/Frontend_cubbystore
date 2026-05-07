import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Category } from '@/lib/types'

const KEY = ['admin', 'categories'] as const

export function useAdminCategories() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<{ items: Category[] }>('/api/admin/categories').then((r) => r.items),
  })
}

export type CreateCategoryInput = {
  name: string
  slug?: string
  parentId?: string | null
  sortOrder?: number
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      api.post<{ item: Category }>('/api/admin/categories', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<CreateCategoryInput>) =>
      api.patch<{ item: Category }>(`/api/admin/categories/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del<{ ok: true }>(`/api/admin/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
