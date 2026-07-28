import { randomUUID } from 'crypto'
import type { DomainEvent } from '../../../shared/events/domain-event'
import type { ID } from '../../../shared/types/index'
import type { CharacterStats } from './character'

export interface AttributePointAllocatedEvent extends DomainEvent {
  eventType: 'AttributePointAllocated'
  characterId: ID
  attribute: keyof CharacterStats
  amount: number
}

export function createAttributePointAllocatedEvent(
  characterId: ID,
  attribute: keyof CharacterStats,
  amount: number,
): AttributePointAllocatedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'AttributePointAllocated',
    occurredAt: new Date(),
    aggregateId: characterId,
    characterId,
    attribute,
    amount,
  }
}
