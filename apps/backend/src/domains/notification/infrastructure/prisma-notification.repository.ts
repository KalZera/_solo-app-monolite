import { Prisma, type Notification as PrismaNotification, type PrismaClient } from '@prisma/client'
import type { CreateNotificationData, Notification, NotificationChannel, NotificationPreferences, NotificationRepository } from '../domain/notification'
import type { NotificationType } from '../domain/notification-type'
import type { ID } from '../../../shared/types/index'

function toDomain (record: PrismaNotification): Notification {
  return {
    id: record.id,
    userId: record.userId,
    type: record.type as NotificationType,
    channel: record.channel as NotificationChannel,
    title: record.title,
    message: record.message,
    read: record.read,
    metadata: record.metadata as Record<string, unknown> | null,
    createdAt: record.createdAt,
  }
}

export class PrismaNotificationRepository implements NotificationRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async create (data: CreateNotificationData): Promise<Notification> {
    const record = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        channel: data.channel,
        title: data.title,
        message: data.message,
        ...(data.metadata !== undefined && {
          metadata: data.metadata === null ? Prisma.JsonNull : (data.metadata as Prisma.InputJsonValue),
        }),
      },
    })
    return toDomain(record)
  }

  async findById (id: ID): Promise<Notification | null> {
    const record = await this.prisma.notification.findUnique({ where: { id } })
    return record ? toDomain(record) : null
  }

  async findByUserId (userId: ID): Promise<Notification[]> {
    const records = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return records.map(toDomain)
  }

  async markAsRead (id: ID): Promise<Notification> {
    const record = await this.prisma.notification.update({ where: { id }, data: { read: true } })
    return toDomain(record)
  }

  async getPreferences (userId: ID): Promise<NotificationPreferences> {
    // TODO: no NotificationPreference table yet — needs a schema/migration before this can
    // be implemented.
    throw new Error('Not implemented')
  }

  async savePreferences (userId: ID, preferences: NotificationPreferences): Promise<NotificationPreferences> {
    // TODO: no NotificationPreference table yet — needs a schema/migration before this can
    // be implemented.
    throw new Error('Not implemented')
  }
}
