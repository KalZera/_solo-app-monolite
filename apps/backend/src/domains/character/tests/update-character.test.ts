import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateCharacterUseCase } from '../application/update-character'
import { NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryCharacterRepository } from '../infrastructure/in-memory-character-repository'

describe('UpdateCharacterUseCase', () => {
  let repository: InMemoryCharacterRepository

  beforeEach(() => {
    repository = new InMemoryCharacterRepository()
  })

  it('updates simple fields without touching stats', async () => {
    repository.seed({ userId: 'user-1', name: 'Sung Jinwoo', title: 'The Weakest Hunter' })
    const useCase = new UpdateCharacterUseCase(repository)

    const result = await useCase.execute({ userId: 'user-1', title: 'Shadow Monarch' })

    expect(result.name).toBe('Sung Jinwoo')
    expect(result.title).toBe('Shadow Monarch')
  })

  it('merges partial stat updates and recalculates power score', async () => {
    repository.seed({
      userId: 'user-1',
      name: 'Sung Jinwoo',
      stats: { strength: 1, intelligence: 1, agility: 1, vitality: 1, luck: 1 },
    })
    const useCase = new UpdateCharacterUseCase(repository)

    const result = await useCase.execute({ userId: 'user-1', stats: { strength: 10 } })

    expect(result.stats).toEqual({ strength: 10, intelligence: 1, agility: 1, vitality: 1, luck: 1 })
    expect(result.powerScore).toBe(14)
  })

  it('throws NotFoundError when the user has no character', async () => {
    const useCase = new UpdateCharacterUseCase(repository)

    await expect(useCase.execute({ userId: 'ghost-user', title: 'New Title' })).rejects.toThrow(NotFoundError)
  })

  it('does not update a character belonging to a different user', async () => {
    repository.seed({ userId: 'user-1', name: 'Belongs To User 1' })
    const useCase = new UpdateCharacterUseCase(repository)

    await expect(useCase.execute({ userId: 'user-2', title: 'Hijacked' })).rejects.toThrow(NotFoundError)
  })
})
