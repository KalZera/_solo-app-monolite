import { z } from 'zod'

// Shape of a browser PushSubscription (JSON.stringify'd by the client via
// PushSubscription.toJSON()) — endpoint + the two keys the Push API generates.
export const pushSubscriptionBodySchema = z.object({
  endpoint: z.string().min(1),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})
