import { randomUUID } from 'crypto'
import type { DomainEvent } from '../../../shared/events/domain-event'
import type { ID } from '../../../shared/types/index'
import type { Recurrence } from './recurrence'

// Every quest-lifecycle event carries characterId so cross-cutting consumers (history,
// notifications, dashboard) can react without loading the aggregate. The aggregateId is the
// QuestInstance (the thing that changed), except QuestInstanceCreated which anchors on it too.

export interface QuestInstanceCreatedEvent extends DomainEvent {
  eventType: 'QuestInstanceCreated'
  questInstanceId: ID
  questId: ID
  characterId: ID
  questTitle: string
  recurrence: Recurrence
}

export interface QuestStartedEvent extends DomainEvent {
  eventType: 'QuestStarted'
  questInstanceId: ID
  questId: ID
  characterId: ID
  questTitle: string
}

export interface QuestProgressUpdatedEvent extends DomainEvent {
  eventType: 'QuestProgressUpdated'
  questInstanceId: ID
  questId: ID
  characterId: ID
  progress: number
}

export interface QuestCompletedEvent extends DomainEvent {
  eventType: 'QuestCompleted'
  questInstanceId: ID
  questId: ID
  characterId: ID
  questTitle: string
  rewardXp: number
}

export interface QuestFailedEvent extends DomainEvent {
  eventType: 'QuestFailed'
  questInstanceId: ID
  questId: ID
  characterId: ID
  questTitle: string
}

export interface QuestExpiredEvent extends DomainEvent {
  eventType: 'QuestExpired'
  questInstanceId: ID
  questId: ID
  characterId: ID
  questTitle: string
}

function base (aggregateId: ID) {
  return { eventId: randomUUID(), occurredAt: new Date(), aggregateId }
}

export function createQuestInstanceCreatedEvent (
  questInstanceId: ID,
  questId: ID,
  characterId: ID,
  questTitle: string,
  recurrence: Recurrence
): QuestInstanceCreatedEvent {
  return { ...base(questInstanceId), eventType: 'QuestInstanceCreated', questInstanceId, questId, characterId, questTitle, recurrence }
}

export function createQuestStartedEvent (
  questInstanceId: ID,
  questId: ID,
  characterId: ID,
  questTitle: string
): QuestStartedEvent {
  return { ...base(questInstanceId), eventType: 'QuestStarted', questInstanceId, questId, characterId, questTitle }
}

export function createQuestProgressUpdatedEvent (
  questInstanceId: ID,
  questId: ID,
  characterId: ID,
  progress: number
): QuestProgressUpdatedEvent {
  return { ...base(questInstanceId), eventType: 'QuestProgressUpdated', questInstanceId, questId, characterId, progress }
}

export function createQuestCompletedEvent (
  questInstanceId: ID,
  questId: ID,
  characterId: ID,
  questTitle: string,
  rewardXp: number
): QuestCompletedEvent {
  return { ...base(questInstanceId), eventType: 'QuestCompleted', questInstanceId, questId, characterId, questTitle, rewardXp }
}

export function createQuestFailedEvent (
  questInstanceId: ID,
  questId: ID,
  characterId: ID,
  questTitle: string
): QuestFailedEvent {
  return { ...base(questInstanceId), eventType: 'QuestFailed', questInstanceId, questId, characterId, questTitle }
}

export function createQuestExpiredEvent (
  questInstanceId: ID,
  questId: ID,
  characterId: ID,
  questTitle: string
): QuestExpiredEvent {
  return { ...base(questInstanceId), eventType: 'QuestExpired', questInstanceId, questId, characterId, questTitle }
}
