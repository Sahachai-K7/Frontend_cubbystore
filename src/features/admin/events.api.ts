import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Paginated, WebhookEvent } from '@/lib/types'

export type EventStatus = WebhookEvent['status']

export type EventFilters = {
  status?: EventStatus
  from?: string
  to?: string
  q?: string
  page: number
  limit?: number
}

export function useWebhookEvents(params: EventFilters) {
  return useQuery({
    queryKey: ['admin', 'webhook', 'events', params],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (params.status) sp.set('status', params.status)
      if (params.from) sp.set('from', params.from)
      if (params.to) sp.set('to', params.to)
      if (params.q) sp.set('q', params.q)
      if (params.page > 1) sp.set('page', String(params.page))
      if (params.limit) sp.set('limit', String(params.limit))
      const qs = sp.toString()
      return api.get<Paginated<WebhookEvent>>(
        `/api/admin/webhook/events${qs ? `?${qs}` : ''}`,
      )
    },
    staleTime: 5_000,
  })
}
