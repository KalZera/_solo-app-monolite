import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateQuestUseCase } from '../application/update-quest'
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import type { Recurrence } from '../domain/recurrence'

describe('UpdateQuestUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
  })

  function build () {
    return new UpdateQuestUseCase(questRepository, characterRepository)
  }

  it('updates template fields and re-derives XP from the new rank', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Old', rank: 'E', rewardXp: 10 })

    const result = await build().execute({ userId: 'user-1', questId: quest.id, title: 'New', rank: 'A' })

    expect(result.title).toBe('New')
    expect(result.rank).toBe('A')
    expect(result.rewardXp).toBe(250)
  })

  it('updates recurrence and active flag', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, recurrence: 'DAILY', active: true })

    const result = await build().execute({ userId: 'user-1', questId: quest.id, recurrence: 'WEEKLY', active: false })

    expect(result.recurrence).toBe('WEEKLY')
    expect(result.active).toBe(false)
  })

  it('normalises a submitted deadlineDate to 23:59:59.999 UTC of that day for a NONE quest', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, recurrence: 'NONE' })

    const result = await build().execute({
      userId: 'user-1',
      questId: quest.id,
      deadlineDate: new Date('2026-08-10T12:00:00.000Z'),
    })

    expect(result.deadlineDate).toEqual(new Date('2026-08-10T23:59:59.999Z'))
  })

  it('drops a submitted deadlineDate when the quest is not NONE', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, recurrence: 'DAILY' })

    const result = await build().execute({
      userId: 'user-1',
      questId: quest.id,
      deadlineDate: new Date('2026-08-10T12:00:00.000Z'),
    })

    expect(result.deadlineDate).toBeNull()
  })

  it('rejects an invalid rank', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id })
    await expect(build().execute({ userId: 'user-1', questId: quest.id, rank: 'Z' })).rejects.toThrow(ValidationError)
  })

  it('rejects an invalid recurrence', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id })
    await expect(
      build().execute({ userId: 'user-1', questId: quest.id, recurrence: 'HOURLY' as Recurrence })
    ).rejects.toThrow(ValidationError)
  })

  it('throws NotFoundError when updating a quest of a different character', async () => {
    const characterA = characterRepository.seed({ userId: 'user-1', name: 'A' })
    characterRepository.seed({ userId: 'user-2', name: 'B' })
    const quest = questRepository.seed({ characterId: characterA.id })
    await expect(build().execute({ userId: 'user-2', questId: quest.id, title: 'Hijack' })).rejects.toThrow(
      NotFoundError
    )
  })
})
