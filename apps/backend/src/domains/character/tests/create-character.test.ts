import { describe, it, expect, beforeEach } from 'vitest'
import { CreateCharacterUseCase } from '../application/create-character.js'
import { ConflictError } from '../../../shared/errors/app-error.js'
import { InMemoryCharacterRepository } from './helpers/in-memory-character-repository.js'

describe('CreateCharacterUseCase', () => {
  let repository: InMemoryCharacterRepository

  beforeEach(() => {
    repository = new InMemoryCharacterRepository()
  })

  it('creates a character with base stats and returns it', async () => {
    const useCase = new CreateCharacterUseCase(repository)

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

  it('throws ConflictError when user already has a character', async () => {
    repository.seed({ userId: 'user-1', name: 'First Hero' })
    const useCase = new CreateCharacterUseCase(repository)

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
    const useCase = new CreateCharacterUseCase(repository)

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
