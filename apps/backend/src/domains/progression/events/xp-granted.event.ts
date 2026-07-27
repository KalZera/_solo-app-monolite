import { randomUUID } from 'crypto'
import type { DomainEvent } from '../../../shared/events/domain-event'
import type { ID } from '../../../shared/types/index'

export interface XPGrantedEvent extends DomainEvent {
  eventType: 'XPGranted'
  characterId: ID
  amount: number
  source: string
}

export function createXPGrantedEvent(characterId: ID, amount: number, source: string): XPGrantedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'XPGranted',
    occurredAt: new Date(),
    aggregateId: characterId,
    characterId,
    amount,
    source,
  }
}
