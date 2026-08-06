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

  it('activeOnly keeps completed dailies for today but drops completed weeklies', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const daily = questRepository.seed({ characterId: character.id, recurrence: 'DAILY', title: 'Daily' })
    const weekly = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', title: 'Weekly' })

    const materialised = await build().execute({ userId: 'user-1' }, NOW)
    const dailyInstance = materialised.find((instance) => instance.questId === daily.id)
    const weeklyInstance = materialised.find((instance) => instance.questId === weekly.id)
    if (!dailyInstance || !weeklyInstance) throw new Error('instances were not materialised')

    await questInstanceRepository.save(dailyInstance.id, { status: 'COMPLETED', completedAt: NOW })
    await questInstanceRepository.save(weeklyInstance.id, { status: 'COMPLETED', completedAt: NOW })

    const active = await build().execute({ userId: 'user-1', activeOnly: true }, NOW)

    expect(active).toHaveLength(1)
    expect(active[0].questId).toBe(daily.id)
  })

  describe('tab', () => {
    it('daily: returns only DAILY recurrence instances, regardless of status', async () => {
      const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
      const daily = questRepository.seed({ characterId: character.id, recurrence: 'DAILY', title: 'Daily' })
      questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', title: 'Weekly' })

      const materialised = await build().execute({ userId: 'user-1' }, NOW)
      const dailyInstance = materialised.find((instance) => instance.questId === daily.id)
      if (!dailyInstance) throw new Error('daily instance was not materialised')
      await questInstanceRepository.save(dailyInstance.id, { status: 'COMPLETED', completedAt: NOW })

      const result = await build().execute({ userId: 'user-1', tab: 'daily' }, NOW)

      expect(result).toHaveLength(1)
      expect(result[0].questId).toBe(daily.id)
      expect(result[0].status).toBe('COMPLETED')
    })

    it('weekly: returns only open WEEKLY instances, dropping completed ones', async () => {
      const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
      questRepository.seed({ characterId: character.id, recurrence: 'DAILY', title: 'Daily' })
      const openWeekly = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', title: 'Open weekly' })
      const doneWeekly = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', title: 'Done weekly' })

      const materialised = await build().execute({ userId: 'user-1' }, NOW)
      const doneInstance = materialised.find((instance) => instance.questId === doneWeekly.id)
      if (!doneInstance) throw new Error('weekly instance was not materialised')
      await questInstanceRepository.save(doneInstance.id, { status: 'COMPLETED', completedAt: NOW })

      const result = await build().execute({ userId: 'user-1', tab: 'weekly' }, NOW)

      expect(result).toHaveLength(1)
      expect(result[0].questId).toBe(openWeekly.id)
    })

    it('history: returns only terminal instances, across recurrences', async () => {
      const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
      const doneDaily = questRepository.seed({ characterId: character.id, recurrence: 'DAILY', title: 'Done daily' })
      const openWeekly = questRepository.seed({ characterId: character.id, recurrence: 'WEEKLY', title: 'Open weekly' })
      const failedWeekly = questRepository.seed({
        characterId: character.id,
        recurrence: 'WEEKLY',
        title: 'Failed weekly',
      })

      const materialised = await build().execute({ userId: 'user-1' }, NOW)
      const doneDailyInstance = materialised.find((instance) => instance.questId === doneDaily.id)
      const failedInstance = materialised.find((instance) => instance.questId === failedWeekly.id)
      if (!doneDailyInstance || !failedInstance) throw new Error('instances were not materialised')

      await questInstanceRepository.save(doneDailyInstance.id, { status: 'COMPLETED', completedAt: NOW })
      await questInstanceRepository.save(failedInstance.id, { status: 'FAILED' })

      const result = await build().execute({ userId: 'user-1', tab: 'history' }, NOW)

      expect(result).toHaveLength(2)
      expect(result.map((instance) => instance.questId).sort()).toEqual(
        [doneDaily.id, failedWeekly.id].sort()
      )
      expect(result.some((instance) => instance.questId === openWeekly.id)).toBe(false)
    })
  })
})
