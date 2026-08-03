import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateQuestUseCase } from '../application/update-quest'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'

describe('UpdateQuestUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
  })

  it('updates fields and re-derives reward XP from the new rank', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Old title', questRank: 'E', rewardXp: 10 })

    const useCase = new UpdateQuestUseCase(questRepository, characterRepository)
    const result = await useCase.execute({ userId: 'user-1', questId: quest.id, title: 'New title', questRank: 'A' })

    expect(result.title).toBe('New title')
    expect(result.questRank).toBe('A')
    expect(result.rewardXp).toBe(250)
  })

  it('updates the categoryId on a quest owned by the caller', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', categoryId: null })

    const useCase = new UpdateQuestUseCase(questRepository, characterRepository)
    const result = await useCase.execute({ userId: 'user-1', questId: quest.id, categoryId: 'category-1' })

    expect(result.categoryId).toBe('category-1')
  })

  it('rejects updates to a quest that is already completed', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Done quest', status: 'completed' })

    const useCase = new UpdateQuestUseCase(questRepository, characterRepository)

    await expect(useCase.execute({ userId: 'user-1', questId: quest.id, title: 'Try to edit' })).rejects.toThrow(
      ConflictError
    )
  })

  it('rejects changing the type to one that cannot be registered', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', type: 'daily' })

    const useCase = new UpdateQuestUseCase(questRepository, characterRepository)

    await expect(useCase.execute({ userId: 'user-1', questId: quest.id, type: 'side' })).rejects.toThrow(ConflictError)
  })

  it('rejects an invalid quest rank', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', questRank: 'E' })

    const useCase = new UpdateQuestUseCase(questRepository, characterRepository)

    await expect(useCase.execute({ userId: 'user-1', questId: quest.id, questRank: 'Z' })).rejects.toThrow(
      ValidationError
    )
  })

  it('throws NotFoundError when updating a quest owned by a different character', async () => {
    const characterA = characterRepository.seed({ userId: 'user-1', name: 'Hero A' })
    characterRepository.seed({ userId: 'user-2', name: 'Hero B' })
    const quest = questRepository.seed({ characterId: characterA.id, title: 'Quest A' })

    const useCase = new UpdateQuestUseCase(questRepository, characterRepository)

    await expect(useCase.execute({ userId: 'user-2', questId: quest.id, title: 'Hijacked' })).rejects.toThrow(
      NotFoundError
    )
  })
})
