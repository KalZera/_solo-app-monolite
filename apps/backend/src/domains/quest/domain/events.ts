import { randomUUID } from 'crypto'
import type { DomainEvent } from '../../../shared/events/domain-event'
import type { ID } from '../../../shared/types/index'
import type { QuestType } from './quest'

export interface QuestCompletedEvent extends DomainEvent {
  eventType: 'QuestCompleted'
  questId: ID
  characterId: ID
  questType: QuestType
  questTitle: string
}

export interface QuestObjectiveCompletedEvent extends DomainEvent {
  eventType: 'QuestObjectiveCompleted'
  questId: ID
  objectiveId: ID
  characterId: ID
  questTitle: string
  objectiveDescription: string
}

export interface DailyQuestRenewedEvent extends DomainEvent {
  eventType: 'DailyQuestRenewed'
  previousQuestId: ID
  newQuestId: ID
  characterId: ID
  questTitle: string
}

export function createQuestCompletedEvent(
  questId: ID,
  characterId: ID,
  questType: QuestType,
  questTitle: string,
): QuestCompletedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'QuestCompleted',
    occurredAt: new Date(),
    aggregateId: questId,
    questId,
    characterId,
    questType,
    questTitle,
  }
}

export function createQuestObjectiveCompletedEvent(
  questId: ID,
  objectiveId: ID,
  characterId: ID,
  questTitle: string,
  objectiveDescription: string,
): QuestObjectiveCompletedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'QuestObjectiveCompleted',
    occurredAt: new Date(),
    aggregateId: questId,
    questId,
    objectiveId,
    characterId,
    questTitle,
    objectiveDescription,
  }
}

export function createDailyQuestRenewedEvent(
  previousQuestId: ID,
  newQuestId: ID,
  characterId: ID,
  questTitle: string,
): DailyQuestRenewedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'DailyQuestRenewed',
    occurredAt: new Date(),
    aggregateId: newQuestId,
    previousQuestId,
    newQuestId,
    characterId,
    questTitle,
  }
}
