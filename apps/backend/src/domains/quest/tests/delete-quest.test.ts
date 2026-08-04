import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteQuestUseCase } from '../application/delete-quest'
import { NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'

describe('DeleteQuestUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
  })

  function build () {
    return new DeleteQuestUseCase(questRepository, characterRepository)
  }

  it('deletes a template owned by the caller', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id })

    await build().execute({ userId: 'user-1', questId: quest.id })

    expect(await questRepository.findById(quest.id)).toBeNull()
  })

  it('throws NotFoundError deleting a quest of a different character', async () => {
    const characterA = characterRepository.seed({ userId: 'user-1', name: 'A' })
    characterRepository.seed({ userId: 'user-2', name: 'B' })
    const quest = questRepository.seed({ characterId: characterA.id })

    await expect(build().execute({ userId: 'user-2', questId: quest.id })).rejects.toThrow(NotFoundError)
  })

  it('throws NotFoundError when the user has no character', async () => {
    await expect(build().execute({ userId: 'ghost', questId: 'quest-1' })).rejects.toThrow(NotFoundError)
  })
})
