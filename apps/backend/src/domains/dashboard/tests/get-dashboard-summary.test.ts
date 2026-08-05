import { describe, it, expect, beforeEach } from 'vitest'
import { GetDashboardSummaryUseCase } from '../application/get-dashboard-summary'
import { InMemoryQuestRepository } from '../../quest/infrastructure/in-memory-quest-repository'
import { InMemoryQuestInstanceRepository } from '../../quest/infrastructure/in-memory-quest-instance-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import { NotFoundError } from '../../../shared/errors/app-error'

const NOW = new Date('2026-08-04T12:00:00.000Z')

function daysAgo (days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000)
}

describe('GetDashboardSummaryUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let questInstanceRepository: InMemoryQuestInstanceRepository
  let characterRepository: InMemoryCharacterRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    questInstanceRepository = new InMemoryQuestInstanceRepository()
    characterRepository = new InMemoryCharacterRepository()
  })

  function build () {
    return new GetDashboardSummaryUseCase(characterRepository, questRepository, questInstanceRepository)
  }

  it('throws NotFoundError when the user has no character', async () => {
    await expect(build().execute({ userId: 'ghost' }, NOW)).rejects.toThrow(NotFoundError)
  })

  it('returns zeros for a character with no completed quests', async () => {
    characterRepository.seed({ userId: 'user-1', name: 'Hero' })

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    expect(summary).toEqual({ completedQuests: 0, streakDays: 0, pointsToday: 0 })
  })

  it('counts completed quests, sums today XP and computes the streak', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, rewardXp: 50 })

    // Two completions today (points today = 100), plus consecutive previous days.
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: NOW })
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(0) })
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(1) })
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(2) })
    // A gap at day 3, then an older completion that must NOT extend the streak.
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(5) })
    // Non-completed instances are ignored.
    questInstanceRepository.seed({ questId: quest.id, status: 'PENDING' })
    questInstanceRepository.seed({ questId: quest.id, status: 'FAILED', completedAt: daysAgo(1) })

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    expect(summary.completedQuests).toBe(5)
    expect(summary.pointsToday).toBe(100)
    expect(summary.streakDays).toBe(3)
  })

  it('keeps the streak when today is empty but yesterday was completed', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, rewardXp: 20 })

    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(1) })
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', completedAt: daysAgo(2) })

    const summary = await build().execute({ userId: 'user-1' }, NOW)

    expect(summary.pointsToday).toBe(0)
    expect(summary.streakDays).toBe(2)
  })
})
