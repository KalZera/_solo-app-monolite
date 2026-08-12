import type { ID } from '../../../shared/types/index'

// The two keys the browser's Push API generates alongside the endpoint — required to
// encrypt the payload when delivering through the Web Push protocol.
export interface PushSubscriptionKeys {
  p256dh: string
  auth: string
}

// One browser/device subscription for Web Push. A user can have several (one per
// device/browser they enabled push notifications on).
export interface PushSubscription {
  id: ID
  userId: ID
  endpoint: string
  keys: PushSubscriptionKeys
  createdAt: Date
}

export interface CreatePushSubscriptionData {
  userId: ID
  endpoint: string
  keys: PushSubscriptionKeys
}
