import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository } from '../../quest/domain/quest'
import type { QuestInstanceRepository } from '../../quest/domain/quest-instance'
import { NotFoundError } from '../../../shared/errors/app-error'
import { calculatePowerScore } from '../../progression/engines/power-score.engine'
import { calculateRank } from '../../progression/engines/rank.engine'
import type { GetProgressionUseCase } from '../../progression/application/get-progression'
import {
  calculateStreak,
  isSameUTCDay,
  isWithinWeeklyPeriod,
  summarizeToday,
  toHunterAttributes,
  type CompletedQuestRecord,
  type DashboardSummary,
} from '../domain/dashboard-summary'

interface GetDashboardSummaryInput {
  userId: string
}

// Aggregates the dashboard read-model (frontend-refactor's DashboardSummary) from the
// character, its progression snapshot and its quests/executions. Composes existing
// repositories/use-cases (no new query methods); ownership is derived from the
// authenticated user, never trusted from the client.
export class GetDashboardSummaryUseCase {
  constructor (
    private readonly characterRepository: CharacterRepository,
    private readonly questRepository: QuestRepository,
    private readonly questInstanceRepository: QuestInstanceRepository,
    private readonly progression: GetProgressionUseCase
  ) {}

  async execute (input: GetDashboardSummaryInput, now: Date = new Date()): Promise<DashboardSummary> {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const powerScore = calculatePowerScore(character.stats)
    const progress = await this.progression.execute({ userId: input.userId })

    const quests = await this.questRepository.findByCharacterId(character.id)

    const completed: CompletedQuestRecord[] = []
    let dailyTotal = 0
    let dailyCompleted = 0
    let dailyRecurringTotal = 0
    let dailyRecurringCompleted = 0
    let weeklyRecurringTotal = 0
    let weeklyRecurringCompleted = 0

    for (const quest of quests) {
      const instances = await this.questInstanceRepository.findByQuestId(quest.id)

      for (const instance of instances) {
        if (instance.status === 'COMPLETED' && instance.completedAt) {
          completed.push({ completedAt: instance.completedAt, rewardXp: quest.rewardXp })
        }
      }

      if (quest.recurrence === 'DAILY') {
        const todaysInstance = instances.find((instance) => isSameUTCDay(instance.scheduledDate, now))
        const doneToday = todaysInstance?.status === 'COMPLETED'

        // Today's daily board: only daily quests whose today instance has been materialised.
        if (todaysInstance) {
          dailyTotal += 1
          if (doneToday) dailyCompleted += 1
        }

        // Existing daily-recurrence quests: count the active templates (still recurring),
        // regardless of whether today's instance exists yet, and how many are done today.
        if (quest.active === 'ACTIVE') {
          dailyRecurringTotal += 1
          if (doneToday) dailyRecurringCompleted += 1
        }
      }

      // Existing weekly-recurrence quests: same rule as the daily one above, but "done" is
      // measured against this week's instance (the one whose 7-day period contains `now`).
      if (quest.recurrence === 'WEEKLY' && quest.active === 'ACTIVE') {
        weeklyRecurringTotal += 1
        const thisWeeksInstance = instances.find((instance) => isWithinWeeklyPeriod(instance.scheduledDate, now))
        if (thisWeeksInstance?.status === 'COMPLETED') weeklyRecurringCompleted += 1
      }
    }

    const today = summarizeToday(completed, now)

    return {
      name: character.name,
      rank: calculateRank(powerScore),
      level: progress.level,
      power: powerScore,
      xp: progress.totalXp,
      xpCurrentLevel:progress.currentLevelXp,
      xpToNext: progress.nextLevelXp,
      xpRemaining: progress.nextLevelXp - progress.currentLevelXp,
      xpToday: today.xp,
      streakDays: calculateStreak(completed.map((record) => record.completedAt), now),
      attributes: toHunterAttributes(character.stats),
      dailyQuests: { completed: dailyCompleted, total: dailyTotal },
      dailyRecurringQuests: { completed: dailyRecurringCompleted, total: dailyRecurringTotal },
      weeklyRecurringQuests: { completed: weeklyRecurringCompleted, total: weeklyRecurringTotal },
      questsCompletedToday: today.questsCompleted,
    }
  }
}
