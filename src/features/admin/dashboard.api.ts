import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardSummary } from '@/lib/types'

export function useDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<DashboardSummary>('/api/admin/dashboard'),
    staleTime: 30_000,
  })
}
