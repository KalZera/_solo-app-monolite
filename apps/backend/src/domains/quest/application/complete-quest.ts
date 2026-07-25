import type { CharacterRepository } from '../../character/domain/character'
import { ATTRIBUTE_POINTS_PER_LEVEL, calculateXpToNextLevel } from '../../character/domain/character'
import {
  createAttributePointsGrantedEvent,
  createLevelUpEvent,
  createXPGrantedEvent,
} from '../../character/domain/events'
import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { Quest, QuestRepository, QuestStatus } from '../domain/quest'
import {
  MAIN_QUEST_COMPLETION_THRESHOLD,
  calculateDefaultDeadline,
  calculateObjectivesCompletionRatio,
} from '../domain/quest'
import { createDailyQuestRenewedEvent, createQuestCompletedEvent } from '../domain/events'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'

interface CompleteQuestInput {
  userId: string
  questId: string
}

const NON_COMPLETABLE_STATUSES: QuestStatus[] = ['completed', 'failed', 'expired']

export class CompleteQuestUseCase {
  constructor(
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event),
  ) {}

  async execute(input: CompleteQuestInput) {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const quest = await this.questRepository.findById(input.questId)

    if (!quest || quest.characterId !== character.id) {
      throw new NotFoundError('Quest', input.questId)
    }

    if (NON_COMPLETABLE_STATUSES.includes(quest.status)) {
      throw new ConflictError(`A quest with status "${quest.status}" cannot be completed`)
    }

    if (quest.type === 'daily' && quest.expiresAt && new Date() > quest.expiresAt) {
      throw new ConflictError('A daily quest can only be completed before its deadline')
    }

    if (
      quest.type === 'main' &&
      calculateObjectivesCompletionRatio(quest.objectives) <= MAIN_QUEST_COMPLETION_THRESHOLD
    ) {
      throw new ValidationError('A main quest requires more than 70% of its objectives to be completed')
    }

    const updatedQuest = await this.questRepository.save(quest.id, { status: 'completed' })

    await this.publishEvent(createQuestCompletedEvent(updatedQuest.id, character.id, updatedQuest.type))

    let level = character.level
    let experience = character.experience + quest.rewardXp
    const levelsGained: number[] = []

    while (experience >= calculateXpToNextLevel(level)) {
      experience -= calculateXpToNextLevel(level)
      level += 1
      levelsGained.push(level)
    }

    const updatedCharacter = await this.characterRepository.save(character.id, { level, experience })

    await this.publishEvent(createXPGrantedEvent(character.id, quest.rewardXp, 'quest'))

    for (const newLevel of levelsGained) {
      await this.publishEvent(createLevelUpEvent(character.id, newLevel - 1, newLevel))
      await this.publishEvent(createAttributePointsGrantedEvent(character.id, ATTRIBUTE_POINTS_PER_LEVEL))
    }

    const renewedQuest = quest.type === 'daily' ? await this.renewDailyQuest(quest, character.id) : null

    return { quest: updatedQuest, character: updatedCharacter, renewedQuest }
  }

  private async renewDailyQuest(quest: Quest, characterId: string) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const renewedQuest = await this.questRepository.create({
      characterId: quest.characterId,
      title: quest.title,
      description: quest.description,
      questRank: quest.questRank,
      type: quest.type,
      status: 'available',
      rewardXp: quest.rewardXp,
      rewardGold: quest.rewardGold,
      minLevel: quest.minLevel,
      expiresAt: calculateDefaultDeadline('daily', tomorrow),
      objectives: quest.objectives.map((objective) => ({
        description: objective.description,
        target: objective.target,
        current: 0,
        completed: false,
      })),
    })

    await this.publishEvent(createDailyQuestRenewedEvent(quest.id, renewedQuest.id, characterId))

    return renewedQuest
  }
}
