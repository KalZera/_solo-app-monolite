import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { eventBus } from '../../shared/events/domain-event'
import type { QuestFailedEvent } from '../../domains/quest/domain/events'
import { PrismaCharacterRepository } from '../../domains/character/infrastructure/prisma-character-repository'
import { PrismaNotificationRepository } from '../../domains/notification/infrastructure/prisma-notification.repository'
import { PrismaPushSubscriptionRepository } from '../../domains/notification/infrastructure/push/prisma-push-subscription.repository'
import { SendNotificationUseCase } from '../../domains/notification/application/send-notification'
import { ScheduleNotificationUseCase } from '../../domains/notification/application/schedule-notification'

// Grace period before a "quest expired" notification actually goes out. In prod a hunter gets
// a couple hours before being pinged; in dev 10s keeps the feedback loop fast while testing
// the flow end-to-end.
const QUEST_EXPIRED_NOTIFICATION_DELAY_MS = 10 * 1000
  // process.env.NODE_ENV === 'production' ? 2 * 60 * 60 * 1000 : 10 * 1000
  

// Turns QuestFailed (published by ExpireQuestsUseCase, see quest-expiration-scheduler-plugin)
// into a delayed notification. Event-driven on purpose — the expiration job stays focused on
// "did the deadline pass", and this stays a peripheral consumer that never blocks it.
const notificationDispatchPlugin: FastifyPluginAsync = fp(async (app) => {
  const characterRepository = new PrismaCharacterRepository(app.prisma)
  const notificationRepository = new PrismaNotificationRepository(app.prisma)
  const pushSubscriptionRepository = new PrismaPushSubscriptionRepository(app.prisma)
  const sendNotification = new SendNotificationUseCase(notificationRepository, pushSubscriptionRepository)
  const scheduleNotification = new ScheduleNotificationUseCase(sendNotification)

  eventBus.subscribe<QuestFailedEvent>('QuestFailed', async (event) => {
    const character = await characterRepository.findById(event.characterId)
    if (!character) return
    await scheduleNotification.execute({
      userId: character.userId,
      type: 'QUEST_EXPIRED',
      title: 'Quest expired',
      message: `Your quest "${event.questTitle}" has expired.`,
      scheduledFor: new Date(Date.now() + QUEST_EXPIRED_NOTIFICATION_DELAY_MS),
      channel:'PUSH'
    })
  })
})

export { notificationDispatchPlugin }
