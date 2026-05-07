import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { IpAllowlistRow } from '@/lib/types'

const KEY = ['admin', 'ip-allowlist'] as const

export function useIpAllowlist() {
  return useQuery({
    queryKey: KEY,
    queryFn: () =>
      api.get<{ items: IpAllowlistRow[] }>('/api/admin/ip-allowlist').then((r) => r.items),
  })
}

export type IpCreateInput = { cidr: string; label?: string | null; enabled?: boolean }

export function useAddIp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: IpCreateInput) =>
      api.post<{ item: IpAllowlistRow }>('/api/admin/ip-allowlist', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateIp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: string; label?: string | null; enabled?: boolean }) =>
      api.patch<{ item: IpAllowlistRow }>(`/api/admin/ip-allowlist/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteIp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/admin/ip-allowlist/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
