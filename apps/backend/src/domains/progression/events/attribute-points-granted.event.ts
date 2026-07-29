import { randomUUID } from 'crypto'
import type { DomainEvent } from '../../../shared/events/domain-event'
import type { ID } from '../../../shared/types/index'

export interface AttributePointsGrantedEvent extends DomainEvent {
  eventType: 'AttributePointsGranted'
  characterId: ID
  points: number
}

export function createAttributePointsGrantedEvent (characterId: ID, points: number): AttributePointsGrantedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'AttributePointsGranted',
    occurredAt: new Date(),
    aggregateId: characterId,
    characterId,
    points,
  }
}
