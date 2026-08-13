import type { ID } from '../../../shared/types/index'
import type { PushSubscriptionRepository } from '../infrastructure/push/push-subscription.repository'
import { WebPushAdapter, StaleSubscriptionError } from '../infrastructure/push/web-push.adapter'
import { NotificationSocketHub, notificationSocketHub } from '../infrastructure/websocket/notification-socket-hub'
import { NotificationEngine } from '../engine/notification.engine'
import type { Notification, NotificationChannel, NotificationRepository } from '../domain/notification'
import type { NotificationName } from '../domain/notification-type'

interface SendNotificationInput {
  userId: ID
  type: NotificationName
  title: string
  message: string,
  channel:NotificationChannel
}

// Only the PUSH channel is actually wired up to a real adapter so far — EMAIL/WHATSAPP are
// still stubs (see their adapters), so resolveChannels() may report them as preferred but
// this use case has nothing to dispatch them through yet.
export class SendNotificationUseCase {
  constructor (
    private readonly notificationRepository: NotificationRepository,
    private readonly pushSubscriptionRepository: PushSubscriptionRepository,
    private readonly webPushAdapter: WebPushAdapter = new WebPushAdapter(),
    private readonly notificationEngine: NotificationEngine = new NotificationEngine(),
    private readonly socketHub: NotificationSocketHub = notificationSocketHub
  ) {}

  async execute (input: SendNotificationInput): Promise<Notification | null> {
    const preferences = await this.notificationRepository.getPreferences(input.userId)
    const channels = this.notificationEngine.resolveChannels(input.type, preferences)

    if (!channels.includes(input.channel)) return null

    const notification = await this.notificationRepository.create({
      userId: input.userId,
      type: input.type,
      channel: input.channel,
      title: input.title,
      message: input.message,
    })

    // Live delivery to whichever tabs/devices are currently connected — independent of the
    // Web Push dispatch below, which reaches devices even when the app isn't open.
    this.socketHub.push(input.userId, notification)

    if(input.channel === 'PUSH'){
      const subscriptions = await this.pushSubscriptionRepository.findByUserId(input.userId)

      await Promise.all(
        subscriptions.map(async (subscription) => {
          try {
              await this.webPushAdapter.send(subscription, notification)
          } catch (error) {
            if (error instanceof StaleSubscriptionError) {
              await this.pushSubscriptionRepository.deleteByEndpoint(subscription.endpoint)
              return
            }
            console.error('Failed to deliver web push notification', error)
          }
        })
      )
    }

    return notification
  }
}
