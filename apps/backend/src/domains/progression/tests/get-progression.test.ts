import { describe, it, expect, beforeEach } from 'vitest'
import { GetProgressionUseCase } from '../use-cases/get-progression'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import { ProgressionEngine } from '../engines/progression.engine'
import { NotFoundError } from '../../../shared/errors/app-error'

describe('GetProgressionUseCase', () => {
  let characterRepository: InMemoryCharacterRepository
  const engine = new ProgressionEngine()

  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
  })

  function build () {
    return new GetProgressionUseCase(characterRepository)
  }

  it('throws NotFoundError when the user has no character', async () => {
    await expect(build().execute({ userId: 'ghost' })).rejects.toThrow(NotFoundError)
  })

  it('anchors the snapshot on the stored level and layers the in-level experience on top', async () => {
    characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 3, experience: 100 })

    const result = await build().execute({ userId: 'user-1' })

    const expectedTotalXp = engine.calculateTotalXpForLevel(3) + 100
    expect(result).toEqual(engine.getProgress(expectedTotalXp))
    expect(result.level).toBe(3)
  })

  it('reports 0% progress for a fresh character with no in-level experience yet', async () => {
    characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })

    const result = await build().execute({ userId: 'user-1' })

    expect(result.level).toBe(1)
    expect(result.xpIntoCurrentLevel).toBe(0)
    expect(result.progress).toBe(0)
  })

  it('derives attribute points available from the resolved level (5 per level)', async () => {
    characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 4, experience: 0 })

    const result = await build().execute({ userId: 'user-1' })

    expect(result.attributePointsAvailable).toBe(result.level * 5)
  })
})
