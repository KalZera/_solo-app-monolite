// Mirrors the backend's domains/notification/domain/notification.ts.
export type NotificationType = 'QUEST_REMINDER' | 'QUEST_EXPIRED' | 'LEVEL_UP' | 'RANK_UP' | 'PENALTY'
export type NotificationChannel = 'IN_APP' | 'PUSH' | 'EMAIL' | 'WHATSAPP'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  channel: NotificationChannel
  title: string
  message: string
  read?: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
}

// Envelope sent over the notification WebSocket (see notification-websocket-routes.ts on the
// backend). Currently the only message type, but kept tagged so more can be added later
// without breaking existing clients.
export interface NotificationSocketMessage {
  notification: Notification
}
