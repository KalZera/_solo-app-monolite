import type { PrismaClient, PushSubscription as PrismaPushSubscription } from '@prisma/client'
import type { CreatePushSubscriptionData, PushSubscription } from '../../domain/push-subscription'
import type { PushSubscriptionRepository } from './push-subscription.repository'
import type { ID } from '../../../../shared/types/index'

function toDomain (record: PrismaPushSubscription): PushSubscription {
  return {
    id: record.id,
    userId: record.userId,
    endpoint: record.endpoint,
    keys: { p256dh: record.p256dh, auth: record.auth },
    createdAt: record.createdAt,
  }
}

export class PrismaPushSubscriptionRepository implements PushSubscriptionRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async save (data: CreatePushSubscriptionData): Promise<PushSubscription> {
    const record = await this.prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: {
        userId: data.userId,
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
      },
      update: {
        userId: data.userId,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
      },
    })
    return toDomain(record)
  }

  async findByUserId (userId: ID): Promise<PushSubscription[]> {
    const records = await this.prisma.pushSubscription.findMany({ where: { userId } })
    return records.map(toDomain)
  }

  async deleteByEndpoint (endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } })
  }
}
