import webpush from 'web-push'
import type { Notification } from '../../domain/notification'
import type { PushSubscription } from '../../domain/push-subscription'

const DEFAULT_VAPID_SUBJECT = 'mailto:support@soloapp.dev'

// Thrown by WebPushAdapter.send when the push service reports the subscription no longer
// exists (the browser unsubscribed, cleared data, etc.) — callers should delete it instead of
// retrying.
export class StaleSubscriptionError extends Error {
  constructor (public readonly endpoint: string) {
    super(`Push subscription is no longer valid: ${endpoint}`)
  }
}

const STALE_SUBSCRIPTION_STATUS_CODES = [404, 410]

export class WebPushAdapter {
  constructor (
    vapidPublicKey: string = process.env.VAPID_PUBLIC_KEY ?? '',
    vapidPrivateKey: string = process.env.VAPID_PRIVATE_KEY ?? '',
    vapidSubject: string = process.env.VAPID_SUBJECT ?? DEFAULT_VAPID_SUBJECT
  ) {
    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
    }
  }

  async send (subscription: PushSubscription, notification: Notification): Promise<void> {
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: subscription.keys },
        JSON.stringify({ title: notification.title, message: notification.message })
      )
    } catch (error) {
      if (error instanceof webpush.WebPushError && STALE_SUBSCRIPTION_STATUS_CODES.includes(error.statusCode)) {
        throw new StaleSubscriptionError(subscription.endpoint)
      }
      throw error
    }
  }
}
