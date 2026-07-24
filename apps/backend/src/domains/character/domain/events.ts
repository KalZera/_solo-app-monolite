import { randomUUID } from 'crypto'
import type { DomainEvent } from '../../../shared/events/domain-event'
import type { ID } from '../../../shared/types/index'

export interface XPGrantedEvent extends DomainEvent {
  eventType: 'XPGranted'
  characterId: ID
  amount: number
  source: string
}

export interface LevelUpEvent extends DomainEvent {
  eventType: 'LevelUp'
  characterId: ID
  previousLevel: number
  newLevel: number
}

export interface AttributePointsGrantedEvent extends DomainEvent {
  eventType: 'AttributePointsGranted'
  characterId: ID
  points: number
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

export function createAttributePointsGrantedEvent(characterId: ID, points: number): AttributePointsGrantedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'AttributePointsGranted',
    occurredAt: new Date(),
    aggregateId: characterId,
    characterId,
    points,
  }
}
