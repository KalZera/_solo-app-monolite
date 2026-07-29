import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository, QuestStatus, QuestType } from '../domain/quest'
import { CREATABLE_QUEST_TYPES } from '../domain/quest'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'

interface UpdateQuestInput {
  userId: string
  questId: string
  title?: string
  description?: string
  questRank?: string
  type?: QuestType
  categoryId?: string | null
  status?: QuestStatus
  rewardXp?: number
  rewardGold?: number
  minLevel?: number
  expiresAt?: Date | null
}

export class UpdateQuestUseCase {
  constructor(
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(input: UpdateQuestInput) {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const quest = await this.questRepository.findById(input.questId)

    if (!quest || quest.characterId !== character.id) {
      throw new NotFoundError('Quest', input.questId)
    }

    if (quest.status === 'completed') {
      throw new ConflictError('A completed quest cannot be updated')
    }

    if (input.type !== undefined && quest.type !== input.type) {
      throw new ConflictError('A quest cannot be a type updated')
    }

    if (input.type !== undefined && !CREATABLE_QUEST_TYPES.includes(input.type)) {
      throw new ValidationError(`A quest can only be registered as one of: ${CREATABLE_QUEST_TYPES.join(', ')}`)
    }

    if (input.rewardXp !== undefined && input.rewardXp <= 0) {
      throw new ValidationError('A quest cannot be created with 0 (or less) XP reward')
    }

    return this.questRepository.save(quest.id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.questRank !== undefined && { questRank: input.questRank }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.rewardXp !== undefined && { rewardXp: input.rewardXp }),
      ...(input.rewardGold !== undefined && { rewardGold: input.rewardGold }),
      ...(input.minLevel !== undefined && { minLevel: input.minLevel }),
      ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
    })
  }
}
