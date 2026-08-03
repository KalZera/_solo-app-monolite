import type { CharacterRepository } from '../../character/domain/character'
import type { QuestObjective, QuestRepository, QuestType } from '../domain/quest'
import {
  ACTIVE_QUEST_STATUSES,
  CREATABLE_QUEST_TYPES,
  MAX_ACTIVE_DAILY_QUESTS,
  QUEST_RANKS,
  calculateDefaultDeadline,
  isQuestRank,
  xpForQuestRank,
} from '../domain/quest'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'

interface CreateQuestInput {
  userId: string
  title: string
  description: string
  questRank: string
  type?: QuestType
  categoryId?: string | null
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

    if (!input.title?.trim() || !input.description?.trim()) {
      throw new ValidationError('A quest must have a title and a description')
    }

    if (!isQuestRank(input.questRank)) {
      throw new ValidationError(`A quest rank must be one of: ${QUEST_RANKS.join(', ')}`)
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

    // XP reward is authoritative on the server: derived from the quest rank, never trusted from the client.
    const rewardXp = xpForQuestRank(input.questRank)

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
      rewardXp,
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
