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

// Partial on purpose — a client only ever sends the flags it's toggling (see
// UpdateNotificationPreferencesUseCase, which merges onto the existing preferences).
export const updateNotificationPreferencesBodySchema = z.object({
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  questReminder: z.boolean().optional(),
  questExpired: z.boolean().optional(),
  levelUp: z.boolean().optional(),
  rankUp: z.boolean().optional(),
  penalty: z.boolean().optional(),
})
