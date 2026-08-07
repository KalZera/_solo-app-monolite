import { describe, it, expect, beforeEach } from 'vitest'
import { ApplyLevelUpUseCase } from '../application/apply-level-up'
import { InMemoryProgressionRepository } from '../infrastructure/in-memory-progression-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../../character/infrastructure/in-memory-character-rest-point-repository'
import { ATTRIBUTE_POINTS_PER_LEVEL } from '../engines/attribute.engine'
import { NotFoundError } from '../../../shared/errors/app-error'

describe('ApplyLevelUpUseCase', () => {
  let characterRepository: InMemoryCharacterRepository
  let restPointRepository: InMemoryCharacterRestPointRepository
  let progressionRepository: InMemoryProgressionRepository

  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    restPointRepository = new InMemoryCharacterRestPointRepository()
    progressionRepository = new InMemoryProgressionRepository(characterRepository, restPointRepository)
  })

  function buildUseCase () {
    return new ApplyLevelUpUseCase(progressionRepository)
  }

  it('persists the new level, +1 to every attribute, and the recalculated power score', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 750 })

    const result = await buildUseCase().execute({ characterId: character.id, newLevel: 2 })

    expect(result.level).toBe(2)
    expect(result.stats).toEqual({ strength: 2, intelligence: 2, agility: 2, vitality: 2, luck: 2 })
    expect(result.powerScore).toBe(10)
  })

  it('credits ATTRIBUTE_POINTS_PER_LEVEL rest points', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 750 })

    await buildUseCase().execute({ characterId: character.id, newLevel: 2 })

    const restPoints = await restPointRepository.findByCharacterId(character.id)
    expect(restPoints?.restPoints).toBe(ATTRIBUTE_POINTS_PER_LEVEL)
  })

  it('throws NotFoundError when the character does not exist', async () => {
    await expect(
      buildUseCase().execute({ characterId: 'ghost-character', newLevel: 2 })
    ).rejects.toThrow(NotFoundError)
  })
})
