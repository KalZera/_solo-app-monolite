import type { ID } from '../../../shared/types/index'
import type { NotificationName } from './notification-type'

export type NotificationChannel ='IN_APP'| 'PUSH' | 'EMAIL' | 'WHATSAPP'

export interface Notification {
  id: ID
  userId: ID
  type: NotificationName
  channel: NotificationChannel
  title: string
  message: string
  read?: boolean
  metadata: Record<string, unknown> | null
  createdAt: Date
}

export interface CreateNotificationData {
  userId: ID
  type: NotificationName
  channel: NotificationChannel
  title: string
  message: string
  metadata?: Record<string, unknown> | null
}

export interface NotificationPreferences {
  pushEnabled: boolean
  emailEnabled: boolean
  whatsappEnabled: boolean
  questReminder: boolean
  questExpired: boolean
  levelUp: boolean
  rankUp: boolean
  penalty: boolean
}

export interface NotificationRepository {
  create (data: CreateNotificationData): Promise<Notification>
  findById (id: ID): Promise<Notification | null>
  findByUserId (userId: ID): Promise<Notification[]>
  markAsRead (id: ID): Promise<Notification>
  getPreferences (userId: ID): Promise<NotificationPreferences>
  savePreferences (userId: ID, preferences: NotificationPreferences): Promise<NotificationPreferences>
}
