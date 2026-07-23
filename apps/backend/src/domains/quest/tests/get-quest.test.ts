import { describe, it, expect, beforeEach } from 'vitest'
import { GetQuestUseCase } from '../application/get-quest'
import { NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'

describe('GetQuestUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
  })

  it('returns the quest when it belongs to the caller character', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'My Quest' })

    const useCase = new GetQuestUseCase(questRepository, characterRepository)
    const result = await useCase.execute({ userId: 'user-1', questId: quest.id })

    expect(result.title).toBe('My Quest')
  })

  it('throws NotFoundError when the quest belongs to a different character', async () => {
    const characterA = characterRepository.seed({ userId: 'user-1', name: 'Hero A' })
    characterRepository.seed({ userId: 'user-2', name: 'Hero B' })
    const quest = questRepository.seed({ characterId: characterA.id, title: 'Quest A' })

    const useCase = new GetQuestUseCase(questRepository, characterRepository)

    await expect(useCase.execute({ userId: 'user-2', questId: quest.id })).rejects.toThrow(NotFoundError)
  })

  it('throws NotFoundError when the quest does not exist', async () => {
    characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const useCase = new GetQuestUseCase(questRepository, characterRepository)

    await expect(
      useCase.execute({ userId: 'user-1', questId: 'ghost-quest' }),
    ).rejects.toThrow(NotFoundError)
  })
})
