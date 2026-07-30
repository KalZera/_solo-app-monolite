import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ExpireQuestsUseCase } from '../application/expire-quests'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import type { DomainEvent } from '../../../shared/events/domain-event'

describe('ExpireQuestsUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let publishEvent: ReturnType<typeof vi.fn>
  const now = new Date('2026-07-30T12:00:00.000Z')
  const past = new Date('2026-07-29T00:00:00.000Z')
  const future = new Date('2026-08-01T00:00:00.000Z')

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  it('marks past-due available/in_progress quests as failed and publishes a QuestExpired event for each', async () => {
    const overdueAvailable = questRepository.seed({
      characterId: 'char-1',
      title: 'Overdue available quest',
      type: 'main',
      status: 'available',
      expiresAt: past,
    })
    const overdueInProgress = questRepository.seed({
      characterId: 'char-1',
      title: 'Overdue in-progress quest',
      type: 'daily',
      status: 'in_progress',
      expiresAt: past,
    })
    const stillOpen = questRepository.seed({
      characterId: 'char-1',
      title: 'Not due yet',
      status: 'available',
      expiresAt: future,
    })

    const useCase = new ExpireQuestsUseCase(questRepository, publishEvent)
    const result = await useCase.execute(now)

    expect(result.map((q) => q.title).sort()).toEqual(['Overdue available quest', 'Overdue in-progress quest'])
    expect(result.every((q) => q.status === 'failed')).toBe(true)

    const updatedStillOpenQuest = await questRepository.findById(stillOpen.id)
    expect(updatedStillOpenQuest?.status).toBe('available')

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(2)
    expect(events).toContainEqual(
      expect.objectContaining({ eventType: 'QuestExpired', questId: overdueAvailable.id, characterId: 'char-1' })
    )
    expect(events).toContainEqual(
      expect.objectContaining({ eventType: 'QuestExpired', questId: overdueInProgress.id, characterId: 'char-1' })
    )
  })

  it('does nothing when there are no past-due active quests', async () => {
    questRepository.seed({ characterId: 'char-1', title: 'Fine for now', status: 'available', expiresAt: future })

    const useCase = new ExpireQuestsUseCase(questRepository, publishEvent)
    const result = await useCase.execute(now)

    expect(result).toHaveLength(0)
    expect(publishEvent).not.toHaveBeenCalled()
  })
})
