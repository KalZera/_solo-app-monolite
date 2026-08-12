import { useEffect, useRef } from 'react'
import { useSessionStore } from '@/modules/auth/application/session.store'
import { useToastStore } from '@/shared/notifications/notification.store'
import { buildNotificationSocketUrl } from '../infrastructure/notification.socket'
import type { NotificationSocketMessage } from '../domain/notification.types'

const RECONNECT_DELAY_MS = 3000
const TOAST_DURATION_MS = 5000

/**
 * Keeps a live WebSocket connection to the backend's notification hub while the hunter is
 * authenticated, and surfaces every incoming notification as a toast. Mount once at the app
 * root (see app/_layout.tsx) — reconnects automatically on drop (e.g. the silent token
 * refresh rotating the token), closes on sign-out/unmount.
 */
export function useNotificationSocket() {
  const token = useSessionStore((state) => state.token)
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const push = useToastStore((state) => state.push)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    let socket: WebSocket | null = null
    let stopped = false

    function connect(currentToken: string) {
      socket = new WebSocket(buildNotificationSocketUrl(currentToken))

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as NotificationSocketMessage
          
          if (data.notification.channel === 'IN_APP') {
            push({
              variant: 'info',
              title: data.notification.title,
              message: data.notification.message,
              duration: TOAST_DURATION_MS,
            })
          }
        } catch {
          // Ignore malformed frames.
        }
      }

      socket.onclose = () => {
        if (stopped) return
        reconnectTimer.current = setTimeout(() => connect(currentToken), RECONNECT_DELAY_MS)
      }
    }

    connect(token)

    return () => {
      stopped = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      socket?.close()
    }
  }, [token, isAuthenticated, push])
}
