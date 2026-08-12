import type { ID } from '../../../shared/types/index'
import { SendNotificationUseCase } from './send-notification'
import type { NotificationType } from '../domain/notification-type'

interface ScheduleNotificationInput {
  userId: ID
  type: NotificationType
  title: string
  message: string
  scheduledFor: Date
}

// There's no persistent job queue yet, so "scheduling" is an in-process setTimeout that fires
// SendNotificationUseCase once `scheduledFor` arrives — fine for delays within a process
// lifetime, but anything still pending is lost on restart. Revisit once a real queue exists.
export class ScheduleNotificationUseCase {
  constructor (
    private readonly sendNotification: SendNotificationUseCase
  ) {}

  async execute (input: ScheduleNotificationInput): Promise<void> {
    const delayMs = Math.max(0, input.scheduledFor.getTime() - Date.now())

    setTimeout(() => {
      this.sendNotification
        .execute({ userId: input.userId, type: input.type, title: input.title, message: input.message })
        .catch((error) => {
          console.error('Failed to send scheduled notification', error)
        })
    }, delayMs)
  }
}
