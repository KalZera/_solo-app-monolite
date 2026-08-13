import type { ID } from '../../../shared/types/index'
import type { NotificationPreferences, NotificationRepository } from '../domain/notification'

interface GetNotificationPreferencesInput {
  userId: ID
}

export class GetNotificationPreferencesUseCase {
  constructor (private readonly notificationRepository: NotificationRepository) {}

  async execute (input: GetNotificationPreferencesInput): Promise<NotificationPreferences> {
    return this.notificationRepository.getPreferences(input.userId)
  }
}
