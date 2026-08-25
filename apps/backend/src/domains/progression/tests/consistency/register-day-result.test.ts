import { describe, it, expect, beforeEach } from 'vitest'
import { RegisterDayResultUseCase } from '../../application/consistency/register-day-result'
import { DayResultStatus } from '../../domain/consistency/day-result'
import { InMemoryProgressionStreakRepository } from '../../infrastructure/consistency/in-memory-progression-streak-repository'
import { InMemoryDayResultRepository } from '../../infrastructure/consistency/in-memory-day-result-repository'

const DATE = new Date('2026-08-24T12:00:00.000Z')
const CHARACTER_ID = 'char-1'

describe('RegisterDayResultUseCase', () => {
  let streakRepository: InMemoryProgressionStreakRepository
  let dayResultRepository: InMemoryDayResultRepository

  beforeEach(() => {
    streakRepository = new InMemoryProgressionStreakRepository()
    dayResultRepository = new InMemoryDayResultRepository()
  })

  function buildUseCase (): RegisterDayResultUseCase {
    return new RegisterDayResultUseCase(streakRepository, dayResultRepository)
  }

  it('starts a streak from scratch on a COMPLETED day and records the snapshot', async () => {
    const result = await buildUseCase().execute({
      characterId: CHARACTER_ID,
      status: DayResultStatus.COMPLETED,
      date: DATE,
    })

    expect(result).toMatchObject({
      characterId: CHARACTER_ID,
      status: DayResultStatus.COMPLETED,
      streakBefore: 0,
      streakAfter: 1,
      freezeBefore: 0,
      freezeAfter: 0,
      freezeUsed: false,
    })

    const streak = await streakRepository.findByCharacterId(CHARACTER_ID)
    expect(streak).toMatchObject({ currentStreak: 1, bestStreak: 1, lastEvaluatedDate: expect.any(Date) })
  })

  it('spends a freeze to protect the streak on a FAILED day', async () => {
    streakRepository.seed({
      characterId: CHARACTER_ID,
      currentStreak: 5,
      bestStreak: 5,
      freezeBalance: 2,
      daysUntilFreezeRecovery: 5,
    })

    const result = await buildUseCase().execute({
      characterId: CHARACTER_ID,
      status: DayResultStatus.FAILED,
      date: DATE,
    })

    expect(result).toMatchObject({
      streakBefore: 5,
      streakAfter: 5,
      freezeBefore: 2,
      freezeAfter: 1,
      freezeUsed: true,
    })

    const streak = await streakRepository.findByCharacterId(CHARACTER_ID)
    // Freeze spent → streak untouched and the recovery countdown restarts from the default (7).
    expect(streak).toMatchObject({ currentStreak: 5, freezeBalance: 1, daysUntilFreezeRecovery: 7 })
  })

  it('breaks the streak on a FAILED day with no freeze to spend', async () => {
    streakRepository.seed({
      characterId: CHARACTER_ID,
      currentStreak: 5,
      bestStreak: 9,
      freezeBalance: 0,
      daysUntilFreezeRecovery: 5,
    })

    const result = await buildUseCase().execute({
      characterId: CHARACTER_ID,
      status: DayResultStatus.FAILED,
      date: DATE,
    })

    expect(result).toMatchObject({ streakAfter: 0, freezeUsed: false })

    const streak = await streakRepository.findByCharacterId(CHARACTER_ID)
    expect(streak).toMatchObject({ currentStreak: 0, bestStreak: 9 }) // bestStreak is preserved
  })

  it('advances the streak and earns a freeze back on FREE_COMPLETED', async () => {
    streakRepository.seed({
      characterId: CHARACTER_ID,
      currentStreak: 2,
      bestStreak: 2,
      freezeBalance: 1,
      daysUntilFreezeRecovery: 5,
    })

    const result = await buildUseCase().execute({
      characterId: CHARACTER_ID,
      status: DayResultStatus.FREE_COMPLETED,
      date: DATE,
    })

    expect(result).toMatchObject({ streakAfter: 3, freezeBefore: 1, freezeAfter: 2, freezeUsed: false })
  })

  it('recovers a freeze when the recovery countdown reaches zero', async () => {
    streakRepository.seed({
      characterId: CHARACTER_ID,
      currentStreak: 3,
      bestStreak: 3,
      freezeBalance: 0,
      daysUntilFreezeRecovery: 1, // ticks to 0 this evaluation
    })

    const result = await buildUseCase().execute({
      characterId: CHARACTER_ID,
      status: DayResultStatus.FREE, // no streak change, isolates the recovery
      date: DATE,
    })

    expect(result).toMatchObject({ streakAfter: 3, freezeBefore: 0, freezeAfter: 1 })

    const streak = await streakRepository.findByCharacterId(CHARACTER_ID)
    expect(streak).toMatchObject({ freezeBalance: 1, daysUntilFreezeRecovery: 7 })
  })

  it('is idempotent: a day already settled returns the existing row and leaves the streak untouched', async () => {
    streakRepository.seed({
      characterId: CHARACTER_ID,
      currentStreak: 4,
      bestStreak: 4,
      freezeBalance: 1,
      daysUntilFreezeRecovery: 5,
    })
    const existing = await dayResultRepository.create({
      characterId: CHARACTER_ID,
      date: DATE,
      status: DayResultStatus.COMPLETED,
      streakBefore: 3,
      streakAfter: 4,
      freezeBefore: 1,
      freezeAfter: 1,
      freezeUsed: false,
    })

    const result = await buildUseCase().execute({
      characterId: CHARACTER_ID,
      status: DayResultStatus.FAILED, // would have broken the streak if it ran
      date: DATE,
    })

    expect(result.id).toBe(existing.id)
    const streak = await streakRepository.findByCharacterId(CHARACTER_ID)
    expect(streak).toMatchObject({ currentStreak: 4, freezeBalance: 1 }) // unchanged
  })
})
