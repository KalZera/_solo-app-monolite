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

// What every user starts with — materialised into a NotificationPreference row at
// registration time (see RegisterUserUseCase) and also what NotificationRepository.
// getPreferences falls back to if that row is ever missing (e.g. pre-existing users).
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: false,
  whatsappEnabled: false,
  questReminder: true,
  questExpired: true,
  levelUp: true,
  rankUp: true,
  penalty: true,
}

export interface NotificationRepository {
  create (data: CreateNotificationData): Promise<Notification>
  findById (id: ID): Promise<Notification | null>
  findByUserId (userId: ID): Promise<Notification[]>
  markAsRead (id: ID): Promise<Notification>
  getPreferences (userId: ID): Promise<NotificationPreferences>
  savePreferences (userId: ID, preferences: NotificationPreferences): Promise<NotificationPreferences>
}
