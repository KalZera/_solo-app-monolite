import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ExpireQuestsUseCase } from '../application/expire-quests'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryQuestInstanceRepository } from '../infrastructure/in-memory-quest-instance-repository'
import { STARTED_FAIL_GRACE_PERIOD_DAYS } from '../domain/quest-instance'
import type { DomainEvent } from '../../../shared/events/domain-event'

const DAY_MS = 24 * 60 * 60 * 1000
const GRACE_MS = STARTED_FAIL_GRACE_PERIOD_DAYS * DAY_MS

const NOW = new Date('2026-08-05T00:00:00.000Z')
const PAST = new Date('2026-08-01T00:00:00.000Z') // 4 days before NOW — past PENDING's deadline
const RECENTLY_PAST = new Date(NOW.getTime() - DAY_MS) // 1 day before NOW — within STARTED's grace
const BEYOND_GRACE = new Date(NOW.getTime() - GRACE_MS - 1) // just past the 3-day grace period
const AT_GRACE_BOUNDARY = new Date(NOW.getTime() - GRACE_MS) // exactly 3 days before NOW
const FUTURE = new Date('2026-08-10T00:00:00.000Z')

describe('ExpireQuestsUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let questInstanceRepository: InMemoryQuestInstanceRepository
  let publishEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    questInstanceRepository = new InMemoryQuestInstanceRepository()
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  function build () {
    return new ExpireQuestsUseCase(questInstanceRepository, publishEvent)
  }

  it('fails PENDING instances past their deadline and publishes QuestFailed (no XP)', async () => {
    const quest = questRepository.seed({ characterId: 'character-1', title: 'Academia' })
    const instance = questInstanceRepository.seed({ questId: quest.id, status: 'PENDING', deadline: PAST, quest })

    const failed = await build().execute(NOW)

    expect(failed).toHaveLength(1)
    expect(failed[0].status).toBe('FAILED')

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      eventType: 'QuestFailed',
      questInstanceId: instance.id,
      characterId: 'character-1',
      questTitle: 'Academia',
    })
    expect(events.some((event) => event.eventType === 'XPGranted')).toBe(false)
  })

  it('does not fail a STARTED instance still within its 3-day grace period', async () => {
    const quest = questRepository.seed({ characterId: 'character-1' })
    questInstanceRepository.seed({ questId: quest.id, status: 'STARTED', deadline: RECENTLY_PAST })

    const failed = await build().execute(NOW)

    expect(failed).toHaveLength(0)
    expect(publishEvent).not.toHaveBeenCalled()
  })

  it('does not fail a STARTED instance exactly at the grace period boundary', async () => {
    const quest = questRepository.seed({ characterId: 'character-1' })
    questInstanceRepository.seed({ questId: quest.id, status: 'STARTED', deadline: AT_GRACE_BOUNDARY })

    const failed = await build().execute(NOW)

    expect(failed).toHaveLength(0)
  })

  it('fails a STARTED instance once past its 3-day grace period, publishing QuestFailed', async () => {
    const quest = questRepository.seed({ characterId: 'character-1', title: 'Academia' })
    const instance = questInstanceRepository.seed({ questId: quest.id, status: 'STARTED', deadline: BEYOND_GRACE })

    const failed = await build().execute(NOW)

    expect(failed).toHaveLength(1)
    expect(failed[0].status).toBe('FAILED')

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toContainEqual(
      expect.objectContaining({ eventType: 'QuestFailed', questInstanceId: instance.id })
    )
  })

  it('does not touch instances whose deadline is in the future', async () => {
    const quest = questRepository.seed({ characterId: 'character-1' })
    questInstanceRepository.seed({ questId: quest.id, status: 'PENDING', deadline: FUTURE })

    const failed = await build().execute(NOW)

    expect(failed).toHaveLength(0)
    expect(publishEvent).not.toHaveBeenCalled()
  })

  it('does not touch already-terminal instances', async () => {
    const quest = questRepository.seed({ characterId: 'character-1' })
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', deadline: PAST })

    const failed = await build().execute(NOW)

    expect(failed).toHaveLength(0)
  })
})
