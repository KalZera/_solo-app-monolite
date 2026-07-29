import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { eventBus } from '../../shared/events/domain-event'
import { PrismaCharacterHistoryRepository } from '../../domains/character/infrastructure/prisma-character-history-repository'
import type { CharacterStats } from '../../domains/character/domain/character'
import type { AttributePointAllocatedEvent } from '../../domains/character/domain/events'
import type {
  QuestCompletedEvent,
  QuestObjectiveCompletedEvent,
  DailyQuestRenewedEvent,
} from '../../domains/quest/domain/events'
import type { LevelUpEvent } from '../../domains/progression/events/level-up.event'
import type { AttributePointsGrantedEvent } from '../../domains/progression/events/attribute-points-granted.event'

const ATTRIBUTE_LABELS: Record<keyof CharacterStats, string> = {
  strength: 'Força',
  intelligence: 'Inteligência',
  agility: 'Agilidade',
  vitality: 'Vitalidade',
  luck: 'Sorte',
}

// Turns select domain events into a human-readable entry in the character's history feed.
// The raw event payload is already persisted verbatim by the event store plugin.
const characterHistoryPlugin: FastifyPluginAsync = fp(async (app) => {
  const characterHistoryRepository = new PrismaCharacterHistoryRepository(app.prisma)
  const recordHistory = (characterId: string, description: string) =>
    characterHistoryRepository.create(characterId, description)

  eventBus.subscribe<QuestCompletedEvent>('QuestCompleted', async (event) => {
    await recordHistory(event.characterId, `Quest "${event.questTitle}" completada.`)
  })

  eventBus.subscribe<QuestObjectiveCompletedEvent>('QuestObjectiveCompleted', async (event) => {
    await recordHistory(
      event.characterId,
      `Objetivo "${event.objectiveDescription}" da quest "${event.questTitle}" foi completado.`
    )
  })

  eventBus.subscribe<DailyQuestRenewedEvent>('DailyQuestRenewed', async (event) => {
    await recordHistory(event.characterId, `Quest diária "${event.questTitle}" foi renovada para o próximo dia.`)
  })

  eventBus.subscribe<LevelUpEvent>('LevelUp', async (event) => {
    await recordHistory(event.characterId, `Subiu para o nível ${event.newLevel}.`)
  })

  eventBus.subscribe<AttributePointsGrantedEvent>('AttributePointsGranted', async (event) => {
    await recordHistory(event.characterId, `Recebeu ${event.points} pontos de atributo.`)
  })

  eventBus.subscribe<AttributePointAllocatedEvent>('AttributePointAllocated', async (event) => {
    const pointWord = event.amount === 1 ? 'ponto' : 'pontos'
    await recordHistory(
      event.characterId,
      `Você adicionou ${event.amount} ${pointWord} em ${ATTRIBUTE_LABELS[event.attribute]}.`
    )
  })
})

export { characterHistoryPlugin }
