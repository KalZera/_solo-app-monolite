import { describe, it, expect, beforeEach } from 'vitest'
import { ListQuestsUseCase } from '../application/list-quests'
import { NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'

describe('ListQuestsUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
  })

  it('returns only quests belonging to the caller character', async () => {
    const characterA = characterRepository.seed({ userId: 'user-1', name: 'Hero A' })
    const characterB = characterRepository.seed({ userId: 'user-2', name: 'Hero B' })
    questRepository.seed({ characterId: characterA.id, title: 'Quest A1' })
    questRepository.seed({ characterId: characterA.id, title: 'Quest A2' })
    questRepository.seed({ characterId: characterB.id, title: 'Quest B1' })

    const useCase = new ListQuestsUseCase(questRepository, characterRepository)
    const result = await useCase.execute({ userId: 'user-1' })

    expect(result).toHaveLength(2)
    expect(result.map((q) => q.title).sort()).toEqual(['Quest A1', 'Quest A2'])
  })

  it('throws NotFoundError when the user has no character', async () => {
    const useCase = new ListQuestsUseCase(questRepository, characterRepository)

    await expect(useCase.execute({ userId: 'ghost-user' })).rejects.toThrow(NotFoundError)
  })

  it('lists active quests before completed/failed/expired ones', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    questRepository.seed({ characterId: character.id, title: 'Completed', status: 'completed' })
    questRepository.seed({ characterId: character.id, title: 'Available', status: 'available' })
    questRepository.seed({ characterId: character.id, title: 'Expired', status: 'expired' })
    questRepository.seed({ characterId: character.id, title: 'In Progress', status: 'in_progress' })
    questRepository.seed({ characterId: character.id, title: 'Failed', status: 'failed' })

    const useCase = new ListQuestsUseCase(questRepository, characterRepository)
    const result = await useCase.execute({ userId: 'user-1' })

    const statuses = result.map((q) => q.status)
    expect(statuses.slice(0, 2).sort()).toEqual(['available', 'in_progress'])
    expect(statuses.slice(2).sort()).toEqual(['completed', 'expired', 'failed'])
  })
})
