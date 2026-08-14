import type { CharacterRepository } from '../../character/domain/character'
import type { CreateQuestData, QuestRepository } from '../domain/quest'
import { QUEST_RANKS, isQuestRank, xpForQuestRank, MAX_ACTIVE_DAILY_QUESTS } from '../domain/quest'
import { isRecurrence, type Recurrence } from '../domain/recurrence'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import type { QuestInstanceRepository } from '../domain/quest-instance'
import { getDateFilter } from '../../../shared/utils/date-filter'

interface CreateQuestInput {
  userId: string
  title: string
  description: string
  rank: string
  recurrence?: Recurrence
  categoryId?: string | null
  // Only meaningful for NONE recurrence (see NoneStrategy) — ignored otherwise.
  deadlineDate?: Date
  objectives?: Array<{ description: string; target: number }>
}

// Creates only the TEMPLATE — never an execution. Instances are materialised on demand by
// GetTodayQuestsUseCase / a worker / a scheduler via the RecurrenceEngine.
export class CreateQuestUseCase {
  constructor (
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly questInstanceRepository: QuestInstanceRepository
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
      throw new ValidationError('A quest recurrence must be one of: NONE, DAILY, WEEKLY, CUSTOM')
    }
    const existingQuests = await this.questRepository.findActiveByCharacterId(character.id)

    if (input.recurrence === 'DAILY') {
      const activeDailyQuestCount = existingQuests.filter(
        (quest) => quest.recurrence === 'DAILY'
      ).length

      if (activeDailyQuestCount >= MAX_ACTIVE_DAILY_QUESTS) {
        throw new ConflictError(`A character cannot have more than ${MAX_ACTIVE_DAILY_QUESTS} active daily quests`)
      }
    }

    const initialObjective = {description: "Concluir no prazo", target:1}
    //variable only if deadlineDate is not provided, otherwise it will be the provided date
    const dayInMilisseconds = 24 * 60 * 60 * 1000
    const {end:tomorrow} = getDateFilter(new Date(Date.now() + dayInMilisseconds));
    // Always end-of-day (23:59:59.999) of whichever date is used, whether it's the
    // client-provided deadlineDate or the "tomorrow" fallback — never the raw instant.
    const providedDeadlineDate = input.deadlineDate ? getDateFilter(input.deadlineDate).end : undefined
    // XP is derived from the rank on the server, never trusted from the client (CARD-103).
    const data: CreateQuestData = {
      characterId: character.id,
      categoryId: input.categoryId ?? null,
      title: input.title,
      description: input.description,
      recurrence,
      rank: input.rank,
      rewardXp: xpForQuestRank(input.rank),
      active: 'ACTIVE',
      // Irrelevant for recurring types, which derive their deadline from the period instead.
      deadlineDate:(providedDeadlineDate ?? tomorrow),
      objectiveTemplates: (input.objectives ?? [initialObjective]).map((objective) => ({
        description: objective.description,
        target: objective.target,
      })),
    }

    const quest = await this.questRepository.create(data)
    let deadlineInstance = tomorrow;

    if(quest.recurrence === 'NONE')
      deadlineInstance = quest.deadlineDate

    if(quest.recurrence === 'WEEKLY'){
      const {end:nextWeek} = getDateFilter(new Date(Date.now() + (dayInMilisseconds * 7)))
      deadlineInstance = nextWeek
    }

    const instance = await this.questInstanceRepository.create({
      questId: quest.id,
      deadline: deadlineInstance,
      scheduledDate: new Date(),
      objectives:(quest?.objectiveTemplates ?? [initialObjective]).map((objective) => ({
        description: objective.description,
        target: objective.target,
      }))
    })

    return { quest, instance }
  }
}
