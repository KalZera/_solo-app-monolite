import { describe, it, expect, beforeEach } from 'vitest'
import { GetProgressionUseCase } from '../application/get-progression'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../../character/infrastructure/in-memory-character-rest-point-repository'
import { ProgressionEngine } from '../engines/progression.engine'
import { NotFoundError } from '../../../shared/errors/app-error'

describe('GetProgressionUseCase', () => {
  let characterRepository: InMemoryCharacterRepository
  let restPointRepository: InMemoryCharacterRestPointRepository
  const engine = new ProgressionEngine()

  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    restPointRepository = new InMemoryCharacterRestPointRepository()
  })

  function build () {
    return new GetProgressionUseCase(characterRepository, restPointRepository)
  }

  it('throws NotFoundError when the user has no character', async () => {
    await expect(build().execute({ userId: 'ghost' })).rejects.toThrow(NotFoundError)
  })

  it('anchors the snapshot on the stored level and layers the in-level experience on top', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 3, experience: 100 })
    await restPointRepository.incrementRestPoints(character.id, 7)

    const result = await build().execute({ userId: 'user-1' })

    const expectedTotalXp = engine.calculateTotalXpForLevel(3) + 100
    expect(result).toEqual(engine.getProgress(expectedTotalXp, 7))
    expect(result.level).toBe(3)
  })

  it('reports 0% progress for a fresh character with no in-level experience yet', async () => {
    characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })

    const result = await build().execute({ userId: 'user-1' })

    expect(result.level).toBe(1)
    expect(result.xpIntoCurrentLevel).toBe(0)
    expect(result.progress).toBe(0)
  })

  it('reports attributePointsAvailable from the character rest points record, not the level', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 4, experience: 0 })
    await restPointRepository.incrementRestPoints(character.id, 13)

    const result = await build().execute({ userId: 'user-1' })

    expect(result.attributePointsAvailable).toBe(13)
  })

  it('defaults attributePointsAvailable to 0 when the character has no rest points record yet', async () => {
    characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 4, experience: 0 })

    const result = await build().execute({ userId: 'user-1' })

    expect(result.attributePointsAvailable).toBe(0)
  })
})
