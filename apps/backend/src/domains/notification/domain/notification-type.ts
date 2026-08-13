// A Notification is always triggered by one of these events — this drives which
// NotificationPreferences flag gates it (see notification-preference.ts) and what the
// NotificationEngine uses to build the content.
export type NotificationName = 'QUEST_REMINDER' | 'QUEST_EXPIRED' | 'LEVEL_UP' | 'RANK_UP' | 'PENALTY'

export const NOTIFICATION_NAMES: NotificationName[] = [
  'QUEST_REMINDER',
  'QUEST_EXPIRED',
  'LEVEL_UP',
  'RANK_UP',
  'PENALTY',
]

export function isNotificationType (value: string): value is NotificationName {
  // TODO
  throw new Error('Not implemented')
}
