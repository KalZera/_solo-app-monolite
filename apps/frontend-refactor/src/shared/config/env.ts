/**
 * Centralised, validated access to runtime environment variables.
 * Only `EXPO_PUBLIC_*` variables are available on the client (Expo inlines them).
 */
const DEFAULT_API_URL = 'http://192.168.15.3:3333/api/v1'

export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL,
  // Public VAPID key for Web Push (safe to expose client-side by design — only the
  // matching private key on the backend must stay secret). Empty means web push
  // registration is skipped (see useWebPushRegistration).
  vapidPublicKey: process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY ?? '',
} as const
