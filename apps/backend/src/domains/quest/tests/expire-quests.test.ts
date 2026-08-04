import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ExpireQuestsUseCase } from '../application/expire-quests'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryQuestInstanceRepository } from '../infrastructure/in-memory-quest-instance-repository'
import type { DomainEvent } from '../../../shared/events/domain-event'

const NOW = new Date('2026-08-05T00:00:00.000Z')
const PAST = new Date('2026-08-01T00:00:00.000Z')
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
    return new ExpireQuestsUseCase(questInstanceRepository, questRepository, publishEvent)
  }

  it('expires active instances past their deadline and publishes QuestExpired (no XP)', async () => {
    const quest = questRepository.seed({ characterId: 'character-1', title: 'Academia' })
    const instance = questInstanceRepository.seed({ questId: quest.id, status: 'PENDING', deadline: PAST })

    const expired = await build().execute(NOW)

    expect(expired).toHaveLength(1)
    expect(expired[0].status).toBe('EXPIRED')

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      eventType: 'QuestExpired',
      questInstanceId: instance.id,
      characterId: 'character-1',
      questTitle: 'Academia',
    })
    expect(events.some((event) => event.eventType === 'XPGranted')).toBe(false)
  })

  it('does not expire instances whose deadline is in the future', async () => {
    const quest = questRepository.seed({ characterId: 'character-1' })
    questInstanceRepository.seed({ questId: quest.id, status: 'PENDING', deadline: FUTURE })

    const expired = await build().execute(NOW)

    expect(expired).toHaveLength(0)
    expect(publishEvent).not.toHaveBeenCalled()
  })

  it('does not touch already-terminal instances', async () => {
    const quest = questRepository.seed({ characterId: 'character-1' })
    questInstanceRepository.seed({ questId: quest.id, status: 'COMPLETED', deadline: PAST })

    const expired = await build().execute(NOW)

    expect(expired).toHaveLength(0)
  })
})
