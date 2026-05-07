import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ContactLinkAdmin, ContactLinkPublic, ContactPlatform } from '@/lib/types'

const PUBLIC_KEY = ['contact-links', 'public'] as const
const ADMIN_KEY = ['admin', 'contact-links'] as const

export function usePublicContactLinks() {
  return useQuery({
    queryKey: PUBLIC_KEY,
    queryFn: () =>
      api.get<{ items: ContactLinkPublic[] }>('/api/contact-links').then((r) => r.items),
    staleTime: 60_000,
  })
}

export function useAdminContactLinks() {
  return useQuery({
    queryKey: ADMIN_KEY,
    queryFn: () =>
      api.get<{ items: ContactLinkAdmin[] }>('/api/admin/contact-links').then((r) => r.items),
  })
}

export type ContactLinkInput = {
  platform: ContactPlatform
  label: string
  url: string
  enabled?: boolean
  sortOrder?: number
}

export function useCreateContactLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ContactLinkInput) =>
      api.post<{ item: ContactLinkAdmin }>('/api/admin/contact-links', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEY })
      qc.invalidateQueries({ queryKey: PUBLIC_KEY })
    },
  })
}

export function useUpdateContactLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<ContactLinkInput>) =>
      api.patch<{ item: ContactLinkAdmin }>(`/api/admin/contact-links/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEY })
      qc.invalidateQueries({ queryKey: PUBLIC_KEY })
    },
  })
}

export function useDeleteContactLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/admin/contact-links/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEY })
      qc.invalidateQueries({ queryKey: PUBLIC_KEY })
    },
  })
}
