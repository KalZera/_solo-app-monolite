import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository } from '../domain/quest'
import { QUEST_RANKS, isQuestRank, xpForQuestRank, type QuestActiveStatus } from '../domain/quest'
import { isRecurrence, type Recurrence } from '../domain/recurrence'
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { getDateFilter } from '../../../shared/utils/date-filter'

interface UpdateQuestInput {
  userId: string
  questId: string
  title?: string
  description?: string
  rank?: string
  recurrence?: Recurrence
  categoryId?: string | null
  // Only meaningful for NONE recurrence (see NoneStrategy) — ignored otherwise.
  deadlineDate?: Date
  active?: QuestActiveStatus
}

// Edits the TEMPLATE only. Past executions (QuestInstances) are never touched.
export class UpdateQuestUseCase {
  constructor (
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository
  ) {}

  async execute (input: UpdateQuestInput) {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null
    if (!character) throw new NotFoundError('Character', input.userId)

    const quest = await this.questRepository.findById(input.questId)
    if (!quest || quest.characterId !== character.id) {
      throw new NotFoundError('Quest', input.questId)
    }

    if (input.rank !== undefined && !isQuestRank(input.rank)) {
      throw new ValidationError(`A quest rank must be one of: ${QUEST_RANKS.join(', ')}`)
    }
    if (input.recurrence !== undefined && !isRecurrence(input.recurrence)) {
      throw new ValidationError('A quest recurrence must be one of: NONE, DAILY, WEEKLY, CUSTOM')
    }

    // Changing the rank re-derives the server-authoritative XP reward.
    const rewardXp =
      input.rank !== undefined && isQuestRank(input.rank) ? xpForQuestRank(input.rank) : undefined

    // deadlineDate only applies to NONE (recurring types derive their deadline from the
    // period); if the quest is/becomes non-NONE, any submitted value is dropped. When it
    // does apply, it's always normalised to 23:59:59.999 UTC of that day — never the raw
    // instant (same rule as CreateQuestUseCase).
    const effectiveRecurrence = input.recurrence ?? quest.recurrence
    const deadlineDate =
      input.deadlineDate !== undefined
        ? getDateFilter(input.deadlineDate).end
        : undefined

    return this.questRepository.save(quest.id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.rank !== undefined && { rank: input.rank }),
      ...(rewardXp !== undefined && { rewardXp }),
      ...(input.recurrence !== undefined && { recurrence: input.recurrence }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(deadlineDate !== undefined && { deadlineDate }),
      ...(input.active !== undefined && { active: input.active }),
    })
  }
}
