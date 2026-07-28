import { describe, it, expect, beforeEach } from 'vitest'
import { GetCharacterHistoryUseCase } from '../application/get-character-history'
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { InMemoryCharacterRepository } from '../infrastructure/in-memory-character-repository'
import { InMemoryCharacterHistoryRepository } from '../infrastructure/in-memory-character-history-repository'

describe('GetCharacterHistoryUseCase', () => {
  let characterRepository: InMemoryCharacterRepository
  let historyRepository: InMemoryCharacterHistoryRepository

  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    historyRepository = new InMemoryCharacterHistoryRepository()
  })

  function buildUseCase() {
    return new GetCharacterHistoryUseCase(characterRepository, historyRepository)
  }

  it('returns the first page of history entries for the logged user character, most recent first', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await historyRepository.create(character.id, 'Quest "A" completada.')
    await historyRepository.create(character.id, 'Subiu para o nível 2.')

    const result = await buildUseCase().execute({ userId: 'user-1' })

    expect(result.data).toHaveLength(2)
    expect(result.data[0].description).toBe('Subiu para o nível 2.')
    expect(result.data[1].description).toBe('Quest "A" completada.')
    expect(result.total).toBe(2)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
  })

  it('paginates using the given page and pageSize', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await historyRepository.create(character.id, 'Entry 1')
    await historyRepository.create(character.id, 'Entry 2')
    await historyRepository.create(character.id, 'Entry 3')

    const firstPage = await buildUseCase().execute({ userId: 'user-1', page: 1, pageSize: 2 })
    expect(firstPage.data.map((e) => e.description)).toEqual(['Entry 3', 'Entry 2'])
    expect(firstPage.total).toBe(3)

    const secondPage = await buildUseCase().execute({ userId: 'user-1', page: 2, pageSize: 2 })
    expect(secondPage.data.map((e) => e.description)).toEqual(['Entry 1'])
  })

  it('does not return history entries from a different character', async () => {
    const characterA = characterRepository.seed({ userId: 'user-1', name: 'Hero A' })
    const characterB = characterRepository.seed({ userId: 'user-2', name: 'Hero B' })
    await historyRepository.create(characterA.id, 'Quest "A" completada.')
    await historyRepository.create(characterB.id, 'Quest "B" completada.')

    const result = await buildUseCase().execute({ userId: 'user-1' })

    expect(result.data).toHaveLength(1)
    expect(result.data[0].description).toBe('Quest "A" completada.')
  })

  it('throws NotFoundError when the user has no character', async () => {
    await expect(buildUseCase().execute({ userId: 'ghost-user' })).rejects.toThrow(NotFoundError)
  })

  it('throws ValidationError for a non-positive page', async () => {
    characterRepository.seed({ userId: 'user-1', name: 'Hero' })

    await expect(buildUseCase().execute({ userId: 'user-1', page: 0 })).rejects.toThrow(ValidationError)
  })

  it('throws ValidationError when pageSize exceeds the maximum', async () => {
    characterRepository.seed({ userId: 'user-1', name: 'Hero' })

    await expect(buildUseCase().execute({ userId: 'user-1', pageSize: 51 })).rejects.toThrow(ValidationError)
  })
})
