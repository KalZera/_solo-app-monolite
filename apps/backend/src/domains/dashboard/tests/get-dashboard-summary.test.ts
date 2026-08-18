import { describe, it, expect, beforeEach } from 'vitest'
import { GetDashboardSummaryUseCase } from '../application/get-dashboard-summary'
import { GetProgressionUseCase } from '../../progression/application/get-progression'
import { ProgressionEngine } from '../../progression/engines/progression.engine'
import { InMemoryQuestRepository } from '../../quest/infrastructure/in-memory-quest-repository'
import { InMemoryQuestInstanceRepository } from '../../quest/infrastructure/in-memory-quest-instance-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../../character/infrastructure/in-memory-character-rest-point-repository'
import { NotFoundError } from '../../../shared/errors/app-error'

const NOW = new Date('2026-08-04T12:00:00.000Z')

function daysAgo (days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000)
}

describe('GetDashboardSummaryUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let questInstanceRepository: InMemoryQuestInstanceRepository
  let characterRepository: InMemoryCharacterRepository
  let restPointRepository: InMemoryCharacterRestPointRepository
  const engine = new ProgressionEngine()

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    questInstanceRepository = new InMemoryQuestInstanceRepository()
    characterRepository = new InMemoryCharacterRepository()
    restPointRepository = new InMemoryCharacterRestPointRepository()
  })

  function build () {
    const progression = new GetProgressionUseCase(characterRepository, restPointRepository)
    return new GetDashboardSummaryUseCase(characterRepository, questRepository, questInstanceRepository, progression)
  }

  it('throws NotFoundError when the user has no character', async () => {
    await expect(build().execute({ userId: 'ghost' }, NOW)).rejects.toThrow(NotFoundError)
  })

  it('returns the hunter summary shape for a character with no quests yet', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 0, experience: 0 })
    const restPoint = restPointRepository.seed({characterId:character.id, restPoints:0})

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    const expectedProgress = engine.getProgress(character.experience, restPoint.restPoints)

    expect(summary).toEqual({
      name: 'Hero',
      rank: 'E',
      level: 0,
      power: 5,
      xp: expectedProgress.totalXp,
      xpToNext: expectedProgress.nextLevelXp - expectedProgress.currentLevelXp,
      xpToday: 0,
      streakDays: 0,
      xpCurrentLevel:expectedProgress.currentLevelXp,
      xpRemaining:expectedProgress.xpRemaining,
      attributes: {
        strength: 1,
        agility: 1,
        intelligence: 1,
        vitality: 1,
        luck: 1,
      },
      dailyQuests: { completed: 0, total: 0 },
      dailyRecurringQuests: { completed: 0, total: 0 },
      weeklyRecurringQuests: { completed: 0, total: 0 },
      questsCompletedToday: 0,
    })
  })

  it('maps the character stats to the dashboard attribute keys (luck -> perception)', async () => {
    characterRepository.seed({
      userId: 'user-1',
      name: 'Hero',
      stats: { strength: 10, agility: 20, intelligence: 30, vitality: 40, luck: 50 },
    })

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    expect(summary.attributes).toEqual({
      strength: 10,
      agility: 20,
      intelligence: 30,
      vitality: 40,
      luck: 50,
    })
  })

  it('derives xp/xpToNext/level/power from the progression snapshot and power score', async () => {
    const character = characterRepository.seed({
      userId: 'user-1',
      name: 'Hero',
      level: 3,
      experience: engine.calculateTotalXpForLevel(3) + 100,
      stats: { strength: 10, agility: 10, intelligence: 10, vitality: 10, luck: 10 },
    })

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    // const totalXp = engine.calculateTotalXpForLevel(3) + 100
    const expected = engine.getProgress(character.experience, 0)
    expect(summary.level).toBe(expected.level)
    expect(summary.xp).toBe(character.experience)
    expect(summary.xpToNext).toBe(expected.nextLevelXp)
    expect(summary.power).toBe(50)
    expect(summary.rank).toBe('E')
  })

  it('computes the streak from completed quest executions', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', rewardXp: 50 })

    // Consecutive completions today and the two previous days.
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(0) })
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(1) })
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(2) })
    // A gap, then an older completion that must NOT extend the streak.
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(5) })
    // Non-completed instances are ignored.
    questInstanceRepository.seed({ questId: quest.id, status: 'PENDING' })
    questInstanceRepository.seed({ questId: quest.id, status: 'FAILED', completedAt: daysAgo(1) })

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    expect(summary.streakDays).toBe(3)
  })

  it('keeps the streak when today is empty but yesterday was completed', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', rewardXp: 20 })

    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(1) })
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(2) })

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    expect(summary.streakDays).toBe(2)
  })

  it('sums xpToday and questsCompletedToday from executions completed today only', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const questA = questRepository.seed({ characterId: character.id, recurrence: 'DAILY', rewardXp: 30 })
    const questB = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', rewardXp: 50 })

    // Two completions today, from different quests — both count.
    questInstanceRepository.seed({ questId: questA.id, status: 'COMPLETED', completedAt: NOW })
    questInstanceRepository.seed({ questId: questB.id, status: 'COMPLETED', completedAt: NOW })
    // Completed yesterday — must not count toward today's totals.
    questInstanceRepository.seed({ questId: questA.id, status: 'COMPLETED', completedAt: daysAgo(1) })
    // Not completed — never counts.
    questInstanceRepository.seed({ questId: questA.id, status: 'PENDING' })

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    expect(summary.xpToday).toBe(80)
    expect(summary.questsCompletedToday).toBe(2)
  })

  it('counts dailyQuests only from DAILY quests with an instance scheduled for today', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const dailyDone = questRepository.seed({ characterId: character.id, recurrence: 'DAILY' })
    const dailyPending = questRepository.seed({ characterId: character.id, recurrence: 'DAILY' })
    const weekly = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY' })

    // Today's instance, completed.
    questInstanceRepository.seed({ questId: dailyDone.id, status: 'COMPLETED', scheduledDate: NOW })
    // Today's instance, still pending.
    questInstanceRepository.seed({ questId: dailyPending.id, status: 'PENDING', scheduledDate: NOW })
    // A DAILY quest's instance from yesterday must not count toward today's total.
    questInstanceRepository.seed({ questId: dailyDone.id, status: 'COMPLETED', scheduledDate: daysAgo(1) })
    // A WEEKLY quest, even with a today-scheduled instance, is not a "daily quest".
    questInstanceRepository.seed({ questId: weekly.id, status: 'COMPLETED', scheduledDate: NOW })

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    expect(summary.dailyQuests).toEqual({ completed: 1, total: 2 })
  })

  it('counts dailyRecurringQuests from ACTIVE daily templates that exist, independent of today instances', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const dailyDone = questRepository.seed({ characterId: character.id, recurrence: 'DAILY', active: 'ACTIVE' })
    // An active daily quest whose today instance hasn't been materialised yet: it still EXISTS.
    const dailyNotMaterialised = questRepository.seed({ characterId: character.id, recurrence: 'DAILY', active: 'ACTIVE' })
    // A cancelled daily quest no longer recurs, so it is not an existing daily quest.
    const dailyCancelled = questRepository.seed({ characterId: character.id, recurrence: 'DAILY', active: 'CANCELLED' })
    // WEEKLY quests are never daily.
    questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', active: 'ACTIVE' })

    questInstanceRepository.seed({ questId: dailyDone.id, status: 'COMPLETED', scheduledDate: NOW })
    // dailyNotMaterialised has no today instance at all.
    void dailyNotMaterialised
    // A cancelled daily quest, even if its today instance is completed, must not count.
    questInstanceRepository.seed({ questId: dailyCancelled.id, status: 'COMPLETED', scheduledDate: NOW })

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    // Two ACTIVE daily templates exist (dailyDone + dailyNotMaterialised); one is done today.
    // The CANCELLED daily quest is excluded even though its today instance is completed.
    expect(summary.dailyRecurringQuests).toEqual({ completed: 1, total: 2 })
    // The existing metric counts every daily quest with a today instance — including the
    // CANCELLED one — and ignores the active template with no today instance yet.
    expect(summary.dailyQuests).toEqual({ completed: 2, total: 2 })
  })

  it('counts weeklyRecurringQuests from ACTIVE weekly templates, completed against this week\'s instance', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const weeklyDone = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', active: 'ACTIVE' })
    const weeklyPending = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', active: 'ACTIVE' })
    // Active weekly whose only instance is from a PAST period — the current week isn't done.
    const weeklyPastPeriod = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', active: 'ACTIVE' })
    // Cancelled weekly no longer recurs — excluded even with a completed instance this week.
    const weeklyCancelled = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', active: 'CANCELLED' })
    // A DAILY quest is never counted as weekly.
    questRepository.seed({ characterId: character.id, recurrence: 'DAILY', active: 'ACTIVE' })

    // This week's period ([daysAgo(3), +7d)) contains NOW → counts as done.
    questInstanceRepository.seed({ questId: weeklyDone.id, status: 'COMPLETED', scheduledDate: daysAgo(3) })
    // This week's instance, still pending → counts in total but not completed.
    questInstanceRepository.seed({ questId: weeklyPending.id, status: 'PENDING', scheduledDate: daysAgo(1) })
    // Completed, but the period ([daysAgo(10), daysAgo(3))) ended before NOW → not this week.
    questInstanceRepository.seed({ questId: weeklyPastPeriod.id, status: 'COMPLETED', scheduledDate: daysAgo(10) })
    // Cancelled quest's this-week completed instance must not count.
    questInstanceRepository.seed({ questId: weeklyCancelled.id, status: 'COMPLETED', scheduledDate: daysAgo(2) })

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    // Three ACTIVE weekly templates exist; only weeklyDone is completed for the current week.
    expect(summary.weeklyRecurringQuests).toEqual({ completed: 1, total: 3 })
  })
})
