import { Platform } from 'react-native'
import { env } from '@/shared/config/env'
import { subscribeToPush } from './notification.requests'

// The Push API wants the VAPID public key as a raw Uint8Array, but it's handed to us
// URL-safe-base64-encoded (see backend .env / web-push.adapter.ts).
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = globalThis.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Web Push (Service Worker + Push API) only exists on the web platform — native iOS/Android
// would need APNs/FCM instead, which is a separate, not-yet-built integration.
export function isWebPushSupported(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'PushManager' in window &&
    env.vapidPublicKey !== ''
  )
}

/**
 * Registers the service worker (public/sw.js), requests Notification permission, subscribes
 * to the browser's Push API and hands the subscription to the backend. Safe to call
 * repeatedly — the browser returns the existing subscription idempotently, and the backend
 * upserts by endpoint.
 */
export async function registerWebPush(): Promise<void> {
  if (!isWebPushSupported()) return
  if (Notification.permission === 'denied') return

  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
  if (permission !== 'granted') return

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(env.vapidPublicKey) as BufferSource,
    })
  }

  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return

  await subscribeToPush({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  })
}

/**
 * Displays an OS-level notification right away, through the same service worker
 * registration/renderer as a real push (icon, badge, click-to-focus — see public/sw.js).
 * Used for notifications tagged channel: 'PUSH' that arrive over the WebSocket while the tab
 * is open — the actual push service round-trip (WebPushAdapter on the backend) is what
 * reaches the device when the tab is closed; this covers the "tab is open" case with no
 * network round-trip needed.
 */
export async function showLocalPushNotification(title: string, message: string): Promise<void> {
  if (!isWebPushSupported()) return
  console.log('chegou aqui', {cond: typeof Notification === 'undefined', cond1:Notification.permission})
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  console.log('chegou aqui 2')

  const registration = await navigator.serviceWorker.ready
  await registration.showNotification(title, {
    body: message,
    icon: '/notification-icon.png',
    badge: '/notification-icon.png',
  })
}
