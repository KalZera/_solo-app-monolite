import type { ID } from '../../../shared/types/index'
import { NotFoundError } from '../../../shared/errors/app-error'
import type { NotificationPreferences, NotificationRepository } from '../domain/notification'

interface UpdateNotificationPreferencesInput {
  userId: ID
  preferences: Partial<NotificationPreferences>
}

// Partial update — merges the submitted flags onto whatever the user already has (or the
// defaults, if this is their first change) so a client only ever needs to send the fields it
// wants to flip.
export class UpdateNotificationPreferencesUseCase {
  constructor (private readonly notificationRepository: NotificationRepository) {}

  async execute (input: UpdateNotificationPreferencesInput): Promise<NotificationPreferences> {
    const current = await this.notificationRepository.getPreferences(input.userId)

    return this.notificationRepository.savePreferences(input.userId, { ...current, ...input.preferences })
  }
}
