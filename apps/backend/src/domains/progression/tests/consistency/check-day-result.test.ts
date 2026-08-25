import { describe, it, expect, beforeEach } from 'vitest'
import { CheckDayResultUseCase } from '../../application/consistency/check-day-result'
import { DayResultStatus } from '../../domain/consistency/day-result'
import { InMemoryQuestRepository } from '../../../quest/infrastructure/in-memory-quest-repository'
import { InMemoryQuestInstanceRepository } from '../../../quest/infrastructure/in-memory-quest-instance-repository'
import type { QuestInstanceStatus } from '../../../quest/domain/quest-instance'

// Noon UTC so day-granular comparisons never straddle a boundary.
const MONDAY = new Date('2026-08-24T12:00:00.000Z') // a regular day
const SUNDAY = new Date('2026-08-23T12:00:00.000Z') // a free day

const CHARACTER_ID = 'char-1'

describe('CheckDayResultUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let questInstanceRepository: InMemoryQuestInstanceRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    questInstanceRepository = new InMemoryQuestInstanceRepository()
  })

  // Seeds `statuses.length` DAILY quests for the character, each with an instance whose deadline
  // falls on `date` (the use case buckets instances by their deadline day) carrying the status.
  function seedDailyQuests (statuses: QuestInstanceStatus[], date: Date): void {
    for (const status of statuses) {
      const quest = questRepository.seed({ characterId: CHARACTER_ID, recurrence: 'DAILY' })
      questInstanceRepository.seed({ questId: quest.id, scheduledDate: date, deadline: date, status })
    }
  }

  function buildUseCase (): CheckDayResultUseCase {
    return new CheckDayResultUseCase(questRepository, questInstanceRepository)
  }

  it('returns COMPLETED on a regular day when at least 70% of daily quests are done', async () => {
    seedDailyQuests(['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING'], MONDAY) // 3/4 = 75%

    const status = await buildUseCase().execute({ characterId: CHARACTER_ID, date: MONDAY })

    expect(status).toBe(DayResultStatus.COMPLETED)
  })

  it('returns FAILED on a regular day below the 70% threshold', async () => {
    seedDailyQuests(['COMPLETED', 'COMPLETED', 'PENDING', 'PENDING'], MONDAY) // 2/4 = 50%

    const status = await buildUseCase().execute({ characterId: CHARACTER_ID, date: MONDAY })

    expect(status).toBe(DayResultStatus.FAILED)
  })

  it('returns FAILED on a regular day with no daily quests at all', async () => {
    const status = await buildUseCase().execute({ characterId: CHARACTER_ID, date: MONDAY })

    expect(status).toBe(DayResultStatus.FAILED)
  })

  it('returns FREE_COMPLETED on Sunday when at least one daily quest is done', async () => {
    seedDailyQuests(['COMPLETED', 'PENDING', 'PENDING', 'PENDING'], SUNDAY) // only 25%, but it is Sunday

    const status = await buildUseCase().execute({ characterId: CHARACTER_ID, date: SUNDAY })

    expect(status).toBe(DayResultStatus.FREE_COMPLETED)
  })

  it('returns FREE on Sunday when no daily quest is done', async () => {
    seedDailyQuests(['PENDING', 'FAILED'], SUNDAY)

    const status = await buildUseCase().execute({ characterId: CHARACTER_ID, date: SUNDAY })

    expect(status).toBe(DayResultStatus.FREE)
  })

  it('only counts instances whose deadline falls on the evaluated day', async () => {
    // Two daily quests due today, but their other instances (another day) must be ignored.
    const questA = questRepository.seed({ characterId: CHARACTER_ID, recurrence: 'DAILY' })
    const questB = questRepository.seed({ characterId: CHARACTER_ID, recurrence: 'DAILY' })
    questInstanceRepository.seed({ questId: questA.id, deadline: MONDAY, status: 'COMPLETED' })
    questInstanceRepository.seed({ questId: questB.id, deadline: MONDAY, status: 'COMPLETED' })
    // Yesterday's instance, FAILED — would drag the ratio down if wrongly counted.
    const yesterday = new Date('2026-08-23T12:00:00.000Z')
    questInstanceRepository.seed({ questId: questA.id, deadline: yesterday, status: 'FAILED' })

    const status = await buildUseCase().execute({ characterId: CHARACTER_ID, date: MONDAY })

    expect(status).toBe(DayResultStatus.COMPLETED) // 2/2 due today
  })
})
