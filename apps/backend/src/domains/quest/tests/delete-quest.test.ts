import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteQuestUseCase } from '../application/delete-quest'
import { ConflictError, NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'

describe('DeleteQuestUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
  })

  it('deletes an available quest owned by the caller', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', status: 'available' })

    const useCase = new DeleteQuestUseCase(questRepository, characterRepository)
    await useCase.execute({ userId: 'user-1', questId: quest.id })

    expect(await questRepository.findById(quest.id)).toBeNull()
  })

  it('rejects deleting a quest already in progress', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', status: 'in_progress' })

    const useCase = new DeleteQuestUseCase(questRepository, characterRepository)

    await expect(useCase.execute({ userId: 'user-1', questId: quest.id })).rejects.toThrow(ConflictError)
  })

  it('rejects deleting a completed quest', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', status: 'completed' })

    const useCase = new DeleteQuestUseCase(questRepository, characterRepository)

    await expect(useCase.execute({ userId: 'user-1', questId: quest.id })).rejects.toThrow(ConflictError)
  })

  it('throws NotFoundError when deleting a quest owned by a different character', async () => {
    const characterA = characterRepository.seed({ userId: 'user-1', name: 'Hero A' })
    characterRepository.seed({ userId: 'user-2', name: 'Hero B' })
    const quest = questRepository.seed({ characterId: characterA.id, title: 'Quest A', status: 'available' })

    const useCase = new DeleteQuestUseCase(questRepository, characterRepository)

    await expect(useCase.execute({ userId: 'user-2', questId: quest.id })).rejects.toThrow(NotFoundError)
  })
})
