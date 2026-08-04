import type { CharacterRepository } from '../../character/domain/character'
import type { CreateQuestData, QuestRepository } from '../domain/quest'
import { QUEST_RANKS, isQuestRank, xpForQuestRank } from '../domain/quest'
import { isRecurrence, type Recurrence } from '../domain/recurrence'
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error'

interface CreateQuestInput {
  userId: string
  title: string
  description: string
  rank: string
  recurrence?: Recurrence
  categoryId?: string | null
  objectives?: Array<{ description: string; target: number }>
}

// Creates only the TEMPLATE — never an execution. Instances are materialised on demand by
// GetTodayQuestsUseCase / a worker / a scheduler via the RecurrenceEngine.
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

    if (!input.title?.trim() || !input.description?.trim()) {
      throw new ValidationError('A quest must have a title and a description')
    }

    if (!isQuestRank(input.rank)) {
      throw new ValidationError(`A quest rank must be one of: ${QUEST_RANKS.join(', ')}`)
    }

    const recurrence = input.recurrence ?? 'NONE'
    if (!isRecurrence(recurrence)) {
      throw new ValidationError('A quest recurrence must be one of: NONE, DAILY, WEEKLY, MONTHLY, CUSTOM')
    }

    // XP is derived from the rank on the server, never trusted from the client (CARD-103).
    const data: CreateQuestData = {
      characterId: character.id,
      categoryId: input.categoryId ?? null,
      title: input.title,
      description: input.description,
      recurrence,
      rank: input.rank,
      rewardXp: xpForQuestRank(input.rank),
      active: true,
      objectiveTemplates: (input.objectives ?? []).map((objective) => ({
        description: objective.description,
        target: objective.target,
      })),
    }

    return this.questRepository.create(data)
  }
}
