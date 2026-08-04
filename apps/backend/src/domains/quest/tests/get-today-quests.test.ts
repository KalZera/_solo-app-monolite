import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetTodayQuestsUseCase } from '../application/get-today-quests'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryQuestInstanceRepository } from '../infrastructure/in-memory-quest-instance-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import { NotFoundError } from '../../../shared/errors/app-error'
import type { DomainEvent } from '../../../shared/events/domain-event'
import type { Recurrence } from '../domain/recurrence'

const NOW = new Date('2026-08-03T12:00:00.000Z')

describe('GetTodayQuestsUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let questInstanceRepository: InMemoryQuestInstanceRepository
  let characterRepository: InMemoryCharacterRepository
  let publishEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    questInstanceRepository = new InMemoryQuestInstanceRepository()
    characterRepository = new InMemoryCharacterRepository()
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  function build () {
    return new GetTodayQuestsUseCase(questRepository, characterRepository, questInstanceRepository, undefined, publishEvent)
  }

  function createdEvents () {
    return publishEvent.mock.calls
      .map((call) => call[0] as DomainEvent)
      .filter((event) => event.eventType === 'QuestInstanceCreated')
  }

  it('creates the instance when missing and reuses it on the next call (no duplication)', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, recurrence: 'DAILY', title: 'Academia' })

    const first = await build().execute({ userId: 'user-1' }, NOW)
    expect(first).toHaveLength(1)
    expect(first[0].questId).toBe(quest.id)
    expect(first[0].status).toBe('PENDING')

    const second = await build().execute({ userId: 'user-1' }, NOW)
    expect(second[0].id).toBe(first[0].id)
    expect(await questInstanceRepository.findByQuestId(quest.id)).toHaveLength(1)
    expect(createdEvents()).toHaveLength(1)
  })

  it.each(['DAILY', 'WEEKLY', 'MONTHLY'] as const)('materialises a %s instance', async (recurrence: Recurrence) => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, recurrence, title: recurrence })

    const instances = await build().execute({ userId: 'user-1' }, NOW)

    expect(instances).toHaveLength(1)
    expect(instances[0].questId).toBe(quest.id)
    expect(instances[0].scheduledDate).toBeInstanceOf(Date)
  })

  it('skips CUSTOM (not schedulable yet) and inactive templates', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    questRepository.seed({ characterId: character.id, recurrence: 'CUSTOM' as Recurrence, title: 'Custom' })
    questRepository.seed({ characterId: character.id, recurrence: 'DAILY', title: 'Inactive', active: false })
    questRepository.seed({ characterId: character.id, recurrence: 'DAILY', title: 'Active' })

    const instances = await build().execute({ userId: 'user-1' }, NOW)

    expect(instances).toHaveLength(1)
  })

  it('throws NotFoundError when the user has no character', async () => {
    await expect(build().execute({ userId: 'ghost' }, NOW)).rejects.toThrow(NotFoundError)
  })
})
