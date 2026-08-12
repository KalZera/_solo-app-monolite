import { httpClient } from '@/shared/api/http-client'

export interface PushSubscriptionPayload {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function subscribeToPush(payload: PushSubscriptionPayload): Promise<unknown> {
  return httpClient.post('/notifications/push-subscriptions', payload)
}

export function unsubscribeFromPush(endpoint: string): Promise<void> {
  return httpClient.delete('/notifications/push-subscriptions', { query: { endpoint } })
}
