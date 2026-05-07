import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PaymentConfig, WebhookConfigSafe } from '@/lib/types'

const PAY_KEY = ['admin', 'payment-config'] as const
const HOOK_KEY = ['admin', 'webhook-config'] as const

export function usePaymentConfig() {
  return useQuery({
    queryKey: PAY_KEY,
    queryFn: () =>
      api.get<{ item: PaymentConfig | null }>('/api/admin/payment-config').then((r) => r.item),
  })
}

export type PaymentConfigInput = {
  promptpayId: string
  promptpayIdType: PaymentConfig['promptpayIdType']
  accountName: string | null
}

export function useSavePaymentConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PaymentConfigInput) =>
      api.put<{ item: PaymentConfig }>('/api/admin/payment-config', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: PAY_KEY }),
  })
}

export function useWebhookConfig() {
  return useQuery({
    queryKey: HOOK_KEY,
    queryFn: () =>
      api
        .get<{ item: WebhookConfigSafe | null }>('/api/admin/webhook-config')
        .then((r) => r.item),
  })
}

export type WebhookSettingsInput = {
  mustContain: string[]
  amountRegex: string
  expiryMinutes: number
  randomMinDelta: number
  randomMaxDelta: number
}

export function useSaveWebhookSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: WebhookSettingsInput) =>
      api.put<{ item: WebhookConfigSafe }>('/api/admin/webhook-config', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: HOOK_KEY }),
  })
}

export function useRotateWebhookKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api.post<{ plaintextKey: string; item: WebhookConfigSafe }>(
        '/api/admin/webhook-config/rotate-key',
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: HOOK_KEY }),
  })
}
