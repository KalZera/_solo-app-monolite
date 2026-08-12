import { randomUUID } from 'crypto'
import type { CreateNotificationData, Notification, NotificationPreferences, NotificationRepository } from '../domain/notification'
import type { ID } from '../../../shared/types/index'

type SeedInput = Pick<Notification, 'userId'> & Partial<Omit<Notification, 'userId'>>

const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: false,
  whatsappEnabled: false,
  questReminder: true,
  questExpired: true,
  levelUp: true,
  rankUp: true,
  penalty: true,
}

export class InMemoryNotificationRepository implements NotificationRepository {
  private notifications: Notification[] = []
  private preferences = new Map<ID, NotificationPreferences>()

  seed (data: SeedInput): Notification {
    const notification: Notification = {
      id: data.id ?? randomUUID(),
      userId: data.userId,
      type: data.type ?? 'QUEST_REMINDER',
      channel: data.channel ?? 'PUSH',
      title: data.title ?? 'Mock notification',
      message: data.message ?? 'Mock notification message',
      read: data.read ?? false,
      metadata: data.metadata ?? null,
      createdAt: data.createdAt ?? new Date(),
    }
    this.notifications.push(notification)
    return notification
  }

  async create (data: CreateNotificationData): Promise<Notification> {
    const notification: Notification = {
      id: randomUUID(),
      userId: data.userId,
      type: data.type,
      channel: data.channel,
      title: data.title,
      message: data.message,
      read: false,
      metadata: data.metadata ?? null,
      createdAt: new Date(),
    }
    this.notifications.push(notification)
    return notification
  }

  async findById (id: ID): Promise<Notification | null> {
    return this.notifications.find((notification) => notification.id === id) ?? null
  }

  async findByUserId (userId: ID): Promise<Notification[]> {
    return this.notifications.filter((notification) => notification.userId === userId)
  }

  async markAsRead (id: ID): Promise<Notification> {
    const index = this.notifications.findIndex((notification) => notification.id === id)
    if (index === -1) throw new Error(`Notification ${id} not found`)
    this.notifications[index] = { ...this.notifications[index], read: true }
    return this.notifications[index]
  }

  async getPreferences (userId: ID): Promise<NotificationPreferences> {
    return this.preferences.get(userId) ?? DEFAULT_PREFERENCES
  }

  async savePreferences (userId: ID, preferences: NotificationPreferences): Promise<NotificationPreferences> {
    this.preferences.set(userId, preferences)
    return preferences
  }
}
