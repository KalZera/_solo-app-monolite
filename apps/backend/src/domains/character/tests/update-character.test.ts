import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateCharacterUseCase } from '../application/update-character'
import { NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryCharacterRepository } from '../infrastructure/in-memory-character-repository'

describe('UpdateCharacterUseCase', () => {
  let repository: InMemoryCharacterRepository

  beforeEach(() => {
    repository = new InMemoryCharacterRepository()
  })

  it('updates editable profile fields (title/class/avatar)', async () => {
    repository.seed({ userId: 'user-1', name: 'Sung Jinwoo', title: 'The Weakest Hunter' })
    const useCase = new UpdateCharacterUseCase(repository)

    const result = await useCase.execute({ userId: 'user-1', title: 'Shadow Monarch' })

    expect(result.name).toBe('Sung Jinwoo')
    expect(result.title).toBe('Shadow Monarch')
  })

  it('never mass-assigns stats, name, level or power score, even if forced through the body', async () => {
    repository.seed({
      userId: 'user-1',
      name: 'Sung Jinwoo',
      title: 'The Weakest Hunter',
      level: 1,
      stats: { strength: 1, intelligence: 1, agility: 1, vitality: 1, luck: 1 },
    })
    const useCase = new UpdateCharacterUseCase(repository)

    const maliciousInput = {
      userId: 'user-1',
      title: 'Shadow Monarch',
      name: 'Hacked Name',
      level: 999,
      powerScore: 999999,
      stats: { strength: 9999, intelligence: 9999, agility: 9999, vitality: 9999, luck: 9999 },
    }

    const result = await useCase.execute(maliciousInput as unknown as Parameters<typeof useCase.execute>[0])

    // Only the whitelisted field changed; everything sensitive is untouched.
    expect(result.title).toBe('Shadow Monarch')
    expect(result.name).toBe('Sung Jinwoo')
    expect(result.level).toBe(1)
    expect(result.stats).toEqual({ strength: 1, intelligence: 1, agility: 1, vitality: 1, luck: 1 })
    expect(result.powerScore).toBe(5)
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
