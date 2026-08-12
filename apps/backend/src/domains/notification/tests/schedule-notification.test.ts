import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ScheduleNotificationUseCase } from '../application/schedule-notification'
import { SendNotificationUseCase } from '../application/send-notification'
import { InMemoryNotificationRepository } from '../infrastructure/in-memory-notification.repository'
import type { Notification } from '../domain/notification'

describe('ScheduleNotificationUseCase', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function build () {
    const notificationRepository = new InMemoryNotificationRepository()
    const sendNotification = new SendNotificationUseCase(notificationRepository)
    const executeSpy = vi.spyOn(sendNotification, 'execute').mockResolvedValue({} as Notification)
    const scheduleNotification = new ScheduleNotificationUseCase(sendNotification)
    return { scheduleNotification, executeSpy }
  }

  it('does not send the notification before the scheduled time arrives', async () => {
    const { scheduleNotification, executeSpy } = build()
    const now = new Date('2026-08-12T10:00:00.000Z')
    vi.setSystemTime(now)

    await scheduleNotification.execute({
      userId: 'user-1',
      type: 'QUEST_EXPIRED',
      title: 'Quest expired',
      message: 'Your quest expired.',
      scheduledFor: new Date(now.getTime() + 10_000),
    })

    vi.advanceTimersByTime(9_999)
    expect(executeSpy).not.toHaveBeenCalled()
  })

  it('sends the notification once the scheduled time arrives', async () => {
    const { scheduleNotification, executeSpy } = build()
    const now = new Date('2026-08-12T10:00:00.000Z')
    vi.setSystemTime(now)

    await scheduleNotification.execute({
      userId: 'user-1',
      type: 'QUEST_EXPIRED',
      title: 'Quest expired',
      message: 'Your quest expired.',
      scheduledFor: new Date(now.getTime() + 10_000),
    })

    await vi.advanceTimersByTimeAsync(10_000)

    expect(executeSpy).toHaveBeenCalledWith({
      userId: 'user-1',
      type: 'QUEST_EXPIRED',
      title: 'Quest expired',
      message: 'Your quest expired.',
    })
  })

  it('sends immediately (no negative delay) when scheduledFor is already in the past', async () => {
    const { scheduleNotification, executeSpy } = build()
    const now = new Date('2026-08-12T10:00:00.000Z')
    vi.setSystemTime(now)

    await scheduleNotification.execute({
      userId: 'user-1',
      type: 'QUEST_EXPIRED',
      title: 'Quest expired',
      message: 'Your quest expired.',
      scheduledFor: new Date(now.getTime() - 5_000),
    })

    await vi.advanceTimersByTimeAsync(0)
    expect(executeSpy).toHaveBeenCalledTimes(1)
  })
})
