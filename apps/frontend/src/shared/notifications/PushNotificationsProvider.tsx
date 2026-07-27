import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import * as Notifications from 'expo-notifications'
import { useSession } from '@/modules/auth/session/SessionProvider'
import { registerForPushNotificationsAsync } from './push-notifications'

export function PushNotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useSession()
  const hasRegistered = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || hasRegistered.current) return
    hasRegistered.current = true

    registerForPushNotificationsAsync().then((token) => {
      if (!token) return
      // TODO: send this token to the backend once a device-registration endpoint exists.
      console.log('Expo push token:', token)
    })
  }, [isAuthenticated])

  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification.request.content.title)
    })

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response.notification.request.content.title)
    })

    return () => {
      receivedSubscription.remove()
      responseSubscription.remove()
    }
  }, [])

  return <>{children}</>
}
