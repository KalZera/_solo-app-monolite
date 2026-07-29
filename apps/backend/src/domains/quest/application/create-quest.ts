import type { CharacterRepository } from '../../character/domain/character'
import type { QuestObjective, QuestRepository, QuestType } from '../domain/quest'
import {
  ACTIVE_QUEST_STATUSES,
  CREATABLE_QUEST_TYPES,
  MAX_ACTIVE_DAILY_QUESTS,
  calculateDefaultDeadline,
} from '../domain/quest'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'

interface CreateQuestInput {
  userId: string
  title: string
  description: string
  questRank: string
  type?: QuestType
  categoryId?: string | null
  rewardXp: number
  rewardGold?: number
  minLevel?: number
  expiresAt?: Date
  objectives?: Array<Pick<QuestObjective, 'description' | 'target'>>
}

export class CreateQuestUseCase {
  constructor (
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository
  ) {}

  async execute (input: CreateQuestInput) {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    // for MVP
    if (!input.type) {
      input.type = 'daily'
    }

    if (!CREATABLE_QUEST_TYPES.includes(input.type)) {
      throw new ValidationError(`A quest can only be registered as one of: ${CREATABLE_QUEST_TYPES.join(', ')}`)
    }

    const existingQuests = await this.questRepository.findByCharacterId(character.id)

    if (input.type === 'daily') {
      const activeDailyQuestCount = existingQuests.filter(
        (quest) => quest.type === 'daily' && ACTIVE_QUEST_STATUSES.includes(quest.status)
      ).length

      if (activeDailyQuestCount >= MAX_ACTIVE_DAILY_QUESTS) {
        throw new ConflictError(`A character cannot have more than ${MAX_ACTIVE_DAILY_QUESTS} active daily quests`)
      }
    }

    if (input.type === 'main' && input.categoryId) {
      const hasActiveMainQuestInCategory = existingQuests.some(
        (quest) =>
          quest.type === 'main' &&
          quest.categoryId === input.categoryId &&
          ACTIVE_QUEST_STATUSES.includes(quest.status)
      )

      if (hasActiveMainQuestInCategory) {
        throw new ConflictError('A character cannot have more than one active main quest per category')
      }
    }

    if (!input.title?.trim() || !input.description?.trim() || !input.questRank?.trim()) {
      throw new ValidationError('A quest must have a title, a description and a quest rank')
    }

    if (!input.rewardXp || input.rewardXp <= 0) {
      throw new ValidationError('A quest cannot be created with 0 (or less) XP reward')
    }
    // for MVP, we will allow quests with only 28 days of duration.
    const expiresAt = input.expiresAt ?? calculateDefaultDeadline(input.type)

    return this.questRepository.create({
      characterId: character.id,
      categoryId: input.categoryId ?? null,
      title: input.title,
      description: input.description,
      questRank: input.questRank,
      type: input.type,
      status: 'available',
      rewardXp: input.rewardXp,
      rewardGold: input.rewardGold ?? 0,
      minLevel: input.minLevel ?? 1,
      expiresAt,
      objectives: (input.objectives ?? []).map((objective) => ({
        description: objective.description,
        target: objective.target,
        current: 0,
        completed: false,
      })),
    })
  }
}
