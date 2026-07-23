import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteCharacterUseCase } from '../application/delete-character'
import { NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryCharacterRepository } from '../infrastructure/in-memory-character-repository'

describe('DeleteCharacterUseCase', () => {
  let repository: InMemoryCharacterRepository

  beforeEach(() => {
    repository = new InMemoryCharacterRepository()
  })

  it('deletes the character belonging to the user', async () => {
    const character = repository.seed({ userId: 'user-1', name: 'Sung Jinwoo' })
    const useCase = new DeleteCharacterUseCase(repository)

    await useCase.execute({ userId: 'user-1' })

    expect(await repository.findById(character.id)).toBeNull()
  })

  it('throws NotFoundError when the user has no character', async () => {
    const useCase = new DeleteCharacterUseCase(repository)

    await expect(useCase.execute({ userId: 'ghost-user' })).rejects.toThrow(NotFoundError)
  })

  it('does not delete a character belonging to a different user', async () => {
    const character = repository.seed({ userId: 'user-1', name: 'Belongs To User 1' })
    const useCase = new DeleteCharacterUseCase(repository)

    await expect(useCase.execute({ userId: 'user-2' })).rejects.toThrow(NotFoundError)

    expect(await repository.findById(character.id)).not.toBeNull()
  })
})
