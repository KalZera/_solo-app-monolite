import type { ID } from '../../../../shared/types/index'
import type { QuestRepository } from '../../../quest/domain/quest'
import type { QuestFullInstance, QuestInstanceRepository } from '../../../quest/domain/quest-instance'
import { DayResultStatus, STREAK_DAILY_COMPLETION_THRESHOLD } from '../../domain/consistency/day-result'

interface CheckDayResultInput {
  characterId: ID
  // The calendar day to evaluate (UTC). Defaults to "now" — the daily job runs for today.
  date?: Date
}

// Sunday in the UTC calendar (business_rules.md: quest deadlines are UTC).
const SUNDAY = 0

function isSameUTCDay (a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

// Classifies a single calendar day for a character into a DayResultStatus, based only on the
// day's DAILY quests. It does not touch the streak state or persist anything — that is a later
// step; this use case answers "what kind of day was it?".
//
// Rules:
//   - Sunday is a free day. If at least one daily quest was completed → FREE_COMPLETED,
//     otherwise → FREE (a free day never FAILS).
//   - Any other day is a normal day. If at least 70% of the day's daily quests were completed
//     → COMPLETED, otherwise → FAILED (no daily quests at all cannot reach the threshold → FAILED).
export class CheckDayResultUseCase {
  constructor (
    private readonly questRepository: QuestRepository,
    private readonly questInstanceRepository: QuestInstanceRepository,
    private readonly completionThreshold: number = STREAK_DAILY_COMPLETION_THRESHOLD
  ) {}

  async execute (input: CheckDayResultInput): Promise<DayResultStatus> {
    const date = input.date ?? new Date()

    const { total, completed } = await this.countDailyQuests(input.characterId, date)

    // Sunday: a free day — the streak is never broken, only enriched by extra effort.
    if (date.getUTCDay() === SUNDAY) {
      return completed > 0 ? DayResultStatus.FREE_COMPLETED : DayResultStatus.FREE
    }
    // Any other day: the 70% completion threshold decides. No daily quests → threshold unmet.
    if (total > 0 && completed / total >= this.completionThreshold) {
      return DayResultStatus.COMPLETED
    }
    return DayResultStatus.FAILED
  }

  // Counts the character's DAILY quest instances scheduled on `date` and how many were COMPLETED.
  private async countDailyQuests (
    characterId: ID,
    date: Date
  ): Promise<{ total: number; completed: number }> {
    const dailyQuests = await this.questRepository.findByCharacterId(characterId, 'DAILY')
    const questIds = dailyQuests.map((quest) => quest.id)

    // One batched query for every daily quest's instances, then keep only the ones scheduled today.
    const instances = await this.questInstanceRepository.findManyByQuests(questIds)
  
    const todaysInstances = instances.filter((instance) => isSameUTCDay(instance.deadline, date))

    const total = todaysInstances.length
    const completed = todaysInstances.filter((instance) => this.isCompleted(instance)).length

    return { total, completed }
  }

  private isCompleted (instance: QuestFullInstance): boolean {
    return instance.status === 'COMPLETED'
  }
}
