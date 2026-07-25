import { randomUUID } from 'crypto'
import type { DomainEvent } from '../../../shared/events/domain-event'
import type { ID } from '../../../shared/types/index'
import type { QuestType } from './quest'

export interface QuestCompletedEvent extends DomainEvent {
  eventType: 'QuestCompleted'
  questId: ID
  characterId: ID
  questType: QuestType
}

export interface DailyQuestRenewedEvent extends DomainEvent {
  eventType: 'DailyQuestRenewed'
  previousQuestId: ID
  newQuestId: ID
  characterId: ID
}

export function createQuestCompletedEvent(questId: ID, characterId: ID, questType: QuestType): QuestCompletedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'QuestCompleted',
    occurredAt: new Date(),
    aggregateId: questId,
    questId,
    characterId,
    questType,
  }
}

export function createDailyQuestRenewedEvent(
  previousQuestId: ID,
  newQuestId: ID,
  characterId: ID,
): DailyQuestRenewedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'DailyQuestRenewed',
    occurredAt: new Date(),
    aggregateId: newQuestId,
    previousQuestId,
    newQuestId,
    characterId,
  }
}
