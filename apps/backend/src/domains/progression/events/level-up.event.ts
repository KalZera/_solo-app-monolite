import { randomUUID } from 'crypto'
import type { DomainEvent } from '../../../shared/events/domain-event'
import type { ID } from '../../../shared/types/index'

export interface LevelUpEvent extends DomainEvent {
  eventType: 'LevelUp'
  characterId: ID
  previousLevel: number
  newLevel: number
}

export function createLevelUpEvent(characterId: ID, previousLevel: number, newLevel: number): LevelUpEvent {
  return {
    eventId: randomUUID(),
    eventType: 'LevelUp',
    occurredAt: new Date(),
    aggregateId: characterId,
    characterId,
    previousLevel,
    newLevel,
  }
}
