import { useEffect } from 'react'
import { useSessionStore } from '@/modules/auth/application/session.store'
import { registerWebPush } from '../infrastructure/web-push-subscription'

/**
 * Once authenticated (web only), asks for Notification permission and subscribes to the
 * browser's Push API so the hunter keeps getting notifications even when the app/tab isn't
 * open. Mount once at the app root (see app/_layout.tsx) alongside useNotificationSocket —
 * that one covers "app is open", this one covers "app is closed". No-ops on native or
 * unsupported/denied browsers (see isWebPushSupported).
 */
export function useWebPushRegistration() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  
  useEffect(() => {
    if (!isAuthenticated) return

    registerWebPush().catch(() => {
      // Best-effort — a denied permission or unsupported browser just means no web push.
    })
  }, [isAuthenticated])
}
