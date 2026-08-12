import type { CreateNotificationData, Notification, NotificationChannel, NotificationPreferences } from '../domain/notification'
import type { NotificationType } from '../domain/notification-type'

// Which NotificationPreferences flag gates each NotificationType — independent of the
// per-channel flags (pushEnabled/emailEnabled/whatsappEnabled), both must allow it.
const TYPE_PREFERENCE_KEY: Record<NotificationType, keyof NotificationPreferences> = {
  QUEST_REMINDER: 'questReminder',
  QUEST_EXPIRED: 'questExpired',
  LEVEL_UP: 'levelUp',
  RANK_UP: 'rankUp',
  PENALTY: 'penalty',
}

// Decides which channels a notification should be dispatched through (based on the
// recipient's NotificationPreferences) and builds the Notification to persist/dispatch.
export class NotificationEngine {
  resolveChannels (type: NotificationType, preferences: NotificationPreferences): NotificationChannel[] {
    if (!preferences[TYPE_PREFERENCE_KEY[type]]) return []

    const channels: NotificationChannel[] = []
    if (preferences.pushEnabled) channels.push('PUSH')
    if (preferences.emailEnabled) channels.push('EMAIL')
    if (preferences.whatsappEnabled) channels.push('WHATSAPP')
    channels.push('IN_APP')
    return channels
  }

  build (data: CreateNotificationData): Notification {
    // TODO
    throw new Error('Not implemented')
  }
}
