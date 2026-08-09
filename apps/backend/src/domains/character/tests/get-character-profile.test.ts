import { describe, it, expect, beforeEach } from 'vitest'
import { GetCharacterProfileUseCase } from '../application/get-character-profile'
import { NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryCharacterRepository } from '../infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../infrastructure/in-memory-character-rest-point-repository'
import { GetProgressionUseCase } from '../../progression/application/get-progression'

describe('GetCharacterProfileUseCase', () => {
  let repository: InMemoryCharacterRepository
  let restPointRepository: InMemoryCharacterRestPointRepository

  beforeEach(() => {
    repository = new InMemoryCharacterRepository()
    restPointRepository = new InMemoryCharacterRestPointRepository()
  })

  function buildUseCase () {
    const progression = new GetProgressionUseCase(repository, restPointRepository)
    return new GetCharacterProfileUseCase(repository, restPointRepository, progression)
  }

  it('returns the character profile with computed power score and rank', async () => {
    repository.seed({
      userId: 'user-1',
      name: 'Sung Jinwoo',
      stats: { strength: 10, intelligence: 10, agility: 10, vitality: 10, luck: 10 },
    })
    const useCase = buildUseCase()

    const result = await useCase.execute({ userId: 'user-1' })

    expect(result.name).toBe('Sung Jinwoo')
    expect(result.powerScore).toBe(50)
    expect(result.rank).toBe('E')
  })

  it('includes the current rest points from the character rest point record', async () => {
    const character = repository.seed({ userId: 'user-1', name: 'Sung Jinwoo' })
    await restPointRepository.incrementRestPoints(character.id, 5)

    const result = await buildUseCase().execute({ userId: 'user-1' })

    expect(result.restPoints).toBe(5)
  })

  it('defaults restPoints to 0 when no rest point record exists yet', async () => {
    repository.seed({ userId: 'user-1', name: 'Sung Jinwoo' })

    const result = await buildUseCase().execute({ userId: 'user-1' })

    expect(result.restPoints).toBe(0)
  })

  it('throws NotFoundError when user has no character', async () => {
    const useCase = buildUseCase()

    await expect(useCase.execute({ userId: 'ghost-user' })).rejects.toThrow(NotFoundError)
  })

  it('does not return a character from a different user', async () => {
    repository.seed({ userId: 'user-1', name: 'Belongs To User 1' })
    const useCase = buildUseCase()

    await expect(useCase.execute({ userId: 'user-2' })).rejects.toThrow(NotFoundError)
  })

  it.each([
    [{ strength: 100, intelligence: 100, agility: 100, vitality: 100, luck: 100 }, 500, 'D'],
    [{ strength: 300, intelligence: 300, agility: 300, vitality: 300, luck: 300 }, 1500, 'C'],
    [{ strength: 700, intelligence: 700, agility: 700, vitality: 700, luck: 700 }, 3500, 'B'],
    [{ strength: 1400, intelligence: 1400, agility: 1400, vitality: 1400, luck: 1400 }, 7000, 'A'],
    [{ strength: 2400, intelligence: 2400, agility: 2400, vitality: 2400, luck: 2400 }, 12000, 'S'],
    [{ strength: 3600, intelligence: 3600, agility: 3600, vitality: 3600, luck: 3600 }, 18000, 'SS'],
    [{ strength: 5200, intelligence: 5200, agility: 5200, vitality: 5200, luck: 5200 }, 26000, 'Monarch'],
  ])('assigns rank correctly for power score %i', async (stats, expectedPowerScore, expectedRank) => {
    repository.seed({ userId: 'user-rank', name: 'Rank Tester', stats })
    const useCase = buildUseCase()

    const result = await useCase.execute({ userId: 'user-rank' })

    expect(result.powerScore).toBe(expectedPowerScore)
    expect(result.rank).toBe(expectedRank)
  })
})
