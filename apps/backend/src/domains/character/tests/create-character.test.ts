import { describe, it, expect, beforeEach } from 'vitest'
import { CreateCharacterUseCase } from '../application/create-character'
import { ConflictError } from '../../../shared/errors/app-error'
import { InMemoryCharacterRepository } from '../infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../infrastructure/in-memory-character-rest-point-repository'

describe('CreateCharacterUseCase', () => {
  let repository: InMemoryCharacterRepository
  let restPointRepository: InMemoryCharacterRestPointRepository

  beforeEach(() => {
    repository = new InMemoryCharacterRepository()
    restPointRepository = new InMemoryCharacterRestPointRepository()
  })

  function buildUseCase() {
    return new CreateCharacterUseCase(repository, restPointRepository)
  }

  it('creates a character with base stats and returns it', async () => {
    const useCase = buildUseCase()

    const result = await useCase.execute({
      userId: 'user-1',
      name: 'Sung Jinwoo',
      class: 'warrior',
      title: 'The Weakest Hunter',
    })

    expect(result.id).toBeDefined()
    expect(result.userId).toBe('user-1')
    expect(result.name).toBe('Sung Jinwoo')
    expect(result.class).toBe('warrior')
    expect(result.title).toBe('The Weakest Hunter')
    expect(result.level).toBe(1)
    expect(result.experience).toBe(0)
    expect(result.stats).toEqual({
      strength: 1,
      intelligence: 1,
      agility: 1,
      vitality: 1,
      luck: 1,
    })
    expect(result.powerScore).toBe(5)
    expect(result.createdAt).toBeInstanceOf(Date)
  })

  it('creates a CharacterRestPoint record with restPoints defaulted to 0', async () => {
    const useCase = buildUseCase()

    const result = await useCase.execute({
      userId: 'user-1',
      name: 'Sung Jinwoo',
      class: 'warrior',
      title: 'The Weakest Hunter',
    })

    const restPoint = restPointRepository.findByCharacterId(result.id)
    expect(restPoint).toBeDefined()
    expect(restPoint?.restPoints).toBe(0)
  })

  it('throws ConflictError when user already has a character', async () => {
    repository.seed({ userId: 'user-1', name: 'First Hero' })
    const useCase = buildUseCase()

    await expect(
      useCase.execute({
        userId: 'user-1',
        name: 'Second Hero',
        class: 'mage',
        title: 'Arcane Master',
      }),
    ).rejects.toThrow(ConflictError)
  })

  it('allows different users to each create their own character', async () => {
    repository.seed({ userId: 'user-1', name: 'First Hero' })
    const useCase = buildUseCase()

    const result = await useCase.execute({
      userId: 'user-2',
      name: 'Another Hero',
      class: 'rogue',
      title: 'Shadow',
    })

    expect(result.userId).toBe('user-2')
    expect(result.name).toBe('Another Hero')
  })
})
