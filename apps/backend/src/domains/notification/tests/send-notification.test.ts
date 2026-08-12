import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SendNotificationUseCase } from '../application/send-notification'
import { InMemoryNotificationRepository } from '../infrastructure/in-memory-notification.repository'
import { InMemoryPushSubscriptionRepository } from '../infrastructure/push/in-memory-push-subscription.repository'
import { WebPushAdapter, StaleSubscriptionError } from '../infrastructure/push/web-push.adapter'
import type { NotificationPreferences } from '../domain/notification'

const ALL_ENABLED: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  whatsappEnabled: true,
  questReminder: true,
  questExpired: true,
  levelUp: true,
  rankUp: true,
  penalty: true,
}

describe('SendNotificationUseCase', () => {
  let notificationRepository: InMemoryNotificationRepository
  let pushSubscriptionRepository: InMemoryPushSubscriptionRepository
  let webPushAdapter: WebPushAdapter
  let sendSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    notificationRepository = new InMemoryNotificationRepository()
    pushSubscriptionRepository = new InMemoryPushSubscriptionRepository()
    webPushAdapter = new WebPushAdapter()
    sendSpy = vi.spyOn(webPushAdapter, 'send').mockResolvedValue(undefined)
  })

  function build () {
    return new SendNotificationUseCase(notificationRepository, pushSubscriptionRepository, webPushAdapter)
  }

  it('creates the notification and pushes it to every subscription of the user', async () => {
    await notificationRepository.savePreferences('user-1', ALL_ENABLED)
    pushSubscriptionRepository.seed({ userId: 'user-1', endpoint: 'https://push.example.com/a' })
    pushSubscriptionRepository.seed({ userId: 'user-1', endpoint: 'https://push.example.com/b' })

    const notification = await build().execute({
      userId: 'user-1',
      type: 'QUEST_EXPIRED',
      title: 'Quest expired',
      message: 'Your quest "Academia" has expired.',
    })

    expect(notification).toMatchObject({
      userId: 'user-1',
      type: 'QUEST_EXPIRED',
      channel: 'IN_APP',
      title: 'Quest expired',
    })
    expect(await notificationRepository.findByUserId('user-1')).toHaveLength(1)
    expect(sendSpy).toHaveBeenCalledTimes(2)
  })

  it('does not create or send anything when the notification type is disabled', async () => {
    await notificationRepository.savePreferences('user-1', { ...ALL_ENABLED, questExpired: false })
    pushSubscriptionRepository.seed({ userId: 'user-1' })

    const notification = await build().execute({
      userId: 'user-1',
      type: 'QUEST_EXPIRED',
      title: 'Quest expired',
      message: 'Your quest has expired.',
    })

    expect(notification).toBeNull()
    expect(await notificationRepository.findByUserId('user-1')).toHaveLength(0)
    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('does not push when the user disabled push, even if the type is enabled', async () => {
    await notificationRepository.savePreferences('user-1', { ...ALL_ENABLED, pushEnabled: false })
    pushSubscriptionRepository.seed({ userId: 'user-1' })

    const notification = await build().execute({
      userId: 'user-1',
      type: 'QUEST_EXPIRED',
      title: 'Quest expired',
      message: 'Your quest has expired.',
    })

    expect(notification).toBeNull()
    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('deletes a subscription once it comes back as stale, without failing the whole send', async () => {
    await notificationRepository.savePreferences('user-1', ALL_ENABLED)
    pushSubscriptionRepository.seed({ userId: 'user-1', endpoint: 'https://push.example.com/stale' })
    sendSpy.mockRejectedValueOnce(new StaleSubscriptionError('https://push.example.com/stale'))

    const notification = await build().execute({
      userId: 'user-1',
      type: 'QUEST_EXPIRED',
      title: 'Quest expired',
      message: 'Your quest has expired.',
    })

    expect(notification).not.toBeNull()
    expect(await pushSubscriptionRepository.findByUserId('user-1')).toHaveLength(0)
  })

  it('keeps delivering to other subscriptions when one delivery fails', async () => {
    await notificationRepository.savePreferences('user-1', ALL_ENABLED)
    pushSubscriptionRepository.seed({ userId: 'user-1', endpoint: 'https://push.example.com/a' })
    pushSubscriptionRepository.seed({ userId: 'user-1', endpoint: 'https://push.example.com/b' })
    sendSpy.mockImplementation(async (subscription) => {
      if (subscription.endpoint === 'https://push.example.com/a') throw new Error('network error')
    })

    const notification = await build().execute({
      userId: 'user-1',
      type: 'QUEST_EXPIRED',
      title: 'Quest expired',
      message: 'Your quest has expired.',
    })

    expect(notification).not.toBeNull()
    expect(sendSpy).toHaveBeenCalledTimes(2)
  })
})
