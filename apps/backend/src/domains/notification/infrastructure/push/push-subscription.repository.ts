import type { ID } from '../../../../shared/types/index'
import type { CreatePushSubscriptionData, PushSubscription } from '../../domain/push-subscription'

export interface PushSubscriptionRepository {
  save (data: CreatePushSubscriptionData): Promise<PushSubscription>
  findByUserId (userId: ID): Promise<PushSubscription[]>
  deleteByEndpoint (endpoint: string): Promise<void>
}
