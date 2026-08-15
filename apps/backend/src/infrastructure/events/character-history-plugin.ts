import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { eventBus } from '../../shared/events/domain-event'
import { PrismaCharacterHistoryRepository } from '../../domains/character/infrastructure/prisma-character-history-repository'
import type { CharacterHistoryEntryType } from '../../domains/character/domain/character-history'
import type { AttributePointAllocatedEvent } from '../../domains/character/domain/events'
import type { QuestCompletedEvent, QuestExpiredEvent, QuestFailedEvent } from '../../domains/quest/domain/events'
import type { LevelUpEvent } from '../../domains/progression/events/level-up.event'
import type { AttributePointsGrantedEvent } from '../../domains/progression/events/attribute-points-granted.event'

// Turns select domain events into a structured entry in the character's history feed — just the
// raw facts (type + payload), never a rendered sentence, so the frontend can translate it via i18n
// at read time. The raw event payload is already persisted verbatim by the event store plugin.
const characterHistoryPlugin: FastifyPluginAsync = fp(async (app) => {
  const characterHistoryRepository = new PrismaCharacterHistoryRepository(app.prisma)
  const recordHistory = (characterId: string, type: CharacterHistoryEntryType, payload: Record<string, unknown>) =>
    characterHistoryRepository.create(characterId, type, payload)

  eventBus.subscribe<QuestCompletedEvent>('QuestCompleted', async (event) => {
    await recordHistory(event.characterId, 'QUEST_COMPLETED', { questTitle: event.questTitle })
  })

  eventBus.subscribe<QuestFailedEvent>('QuestFailed', async (event) => {
    await recordHistory(event.characterId, 'QUEST_FAILED', { questTitle: event.questTitle })
  })

  eventBus.subscribe<QuestExpiredEvent>('QuestExpired', async (event) => {
    await recordHistory(event.characterId, 'QUEST_EXPIRED', { questTitle: event.questTitle })
  })

  eventBus.subscribe<LevelUpEvent>('LevelUp', async (event) => {
    await recordHistory(event.characterId, 'LEVEL_UP', { level: event.newLevel })
  })

  eventBus.subscribe<AttributePointsGrantedEvent>('AttributePointsGranted', async (event) => {
    await recordHistory(event.characterId, 'ATTRIBUTE_POINTS_GRANTED', { points: event.points })
  })

  eventBus.subscribe<AttributePointAllocatedEvent>('AttributePointAllocated', async (event) => {
    await recordHistory(event.characterId, 'ATTRIBUTE_POINT_ALLOCATED', {
      amount: event.amount,
      attribute: event.attribute,
    })
  })
})

export { characterHistoryPlugin }
