import { randomUUID } from 'crypto'
import type { CreatePushSubscriptionData, PushSubscription } from '../../domain/push-subscription'
import type { PushSubscriptionRepository } from './push-subscription.repository'
import type { ID } from '../../../../shared/types/index'

type SeedInput = Pick<PushSubscription, 'userId'> & Partial<Omit<PushSubscription, 'userId'>>

export class InMemoryPushSubscriptionRepository implements PushSubscriptionRepository {
  private subscriptions: PushSubscription[] = []

  seed (data: SeedInput): PushSubscription {
    const subscription: PushSubscription = {
      id: data.id ?? randomUUID(),
      userId: data.userId,
      endpoint: data.endpoint ?? `https://push.example.com/${randomUUID()}`,
      keys: data.keys ?? { p256dh: 'mock-p256dh', auth: 'mock-auth' },
      createdAt: data.createdAt ?? new Date(),
    }
    this.subscriptions.push(subscription)
    return subscription
  }

  async save (data: CreatePushSubscriptionData): Promise<PushSubscription> {
    const existingIndex = this.subscriptions.findIndex((subscription) => subscription.endpoint === data.endpoint)
    const subscription: PushSubscription = {
      id: existingIndex === -1 ? randomUUID() : this.subscriptions[existingIndex].id,
      userId: data.userId,
      endpoint: data.endpoint,
      keys: data.keys,
      createdAt: existingIndex === -1 ? new Date() : this.subscriptions[existingIndex].createdAt,
    }

    if (existingIndex === -1) {
      this.subscriptions.push(subscription)
    } else {
      this.subscriptions[existingIndex] = subscription
    }
    return subscription
  }

  async findByUserId (userId: ID): Promise<PushSubscription[]> {
    return this.subscriptions.filter((subscription) => subscription.userId === userId)
  }

  async deleteByEndpoint (endpoint: string): Promise<void> {
    this.subscriptions = this.subscriptions.filter((subscription) => subscription.endpoint !== endpoint)
  }
}
