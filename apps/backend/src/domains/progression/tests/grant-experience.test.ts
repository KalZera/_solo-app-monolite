import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GrantExperienceUseCase } from '../application/grant-experience'
import { ApplyLevelUpUseCase } from '../application/apply-level-up'
import { InMemoryProgressionRepository } from '../infrastructure/in-memory-progression-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../../character/infrastructure/in-memory-character-rest-point-repository'
import { ProgressionEngine } from '../engines/progression.engine'
import { ATTRIBUTE_POINTS_PER_LEVEL } from '../engines/attribute.engine'
import { NotFoundError } from '../../../shared/errors/app-error'
import type { DomainEvent } from '../../../shared/events/domain-event'

describe('GrantExperienceUseCase', () => {
  let characterRepository: InMemoryCharacterRepository
  let restPointRepository: InMemoryCharacterRestPointRepository
  let progressionRepository: InMemoryProgressionRepository
  let publishEvent: ReturnType<typeof vi.fn>
  const engine = new ProgressionEngine()

  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    restPointRepository = new InMemoryCharacterRestPointRepository()
    progressionRepository = new InMemoryProgressionRepository(characterRepository, restPointRepository)
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  function buildUseCase () {
    const applyLevelUp = new ApplyLevelUpUseCase(progressionRepository)
    return new GrantExperienceUseCase(characterRepository, applyLevelUp, engine, publishEvent)
  }

  it('grants XP and publishes only XPGranted without leveling up', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })

    const result = await buildUseCase().execute({ characterId: character.id, amount: 10, source: 'quest' })

    expect(result.character.experience).toBe(10)
    expect(result.character.level).toBe(1)

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ eventType: 'XPGranted', characterId: character.id, amount: 10, source: 'quest' })
  })

  it('crosses the level threshold, applies the level-up synchronously and publishes LevelUp + AttributePointsGranted', async () => {
    const xpForLevel2 = engine.calculateTotalXpForLevel(2)
    const character = characterRepository.seed({
      userId: 'user-1',
      name: 'Hero',
      level: 1,
      experience: xpForLevel2 - 5,
    })

    const result = await buildUseCase().execute({ characterId: character.id, amount: 10, source: 'quest' })

    expect(result.character.experience).toBe(xpForLevel2 + 5)
    expect(result.character.level).toBe(2)
    expect(result.character.stats).toEqual({ strength: 2, intelligence: 2, agility: 2, vitality: 2, luck: 2 })
    expect(result.character.powerScore).toBe(10)

    const stored = await characterRepository.findById(character.id)
    expect(stored?.level).toBe(2)

    const restPoints = await restPointRepository.findByCharacterId(character.id)
    expect(restPoints?.restPoints).toBe(ATTRIBUTE_POINTS_PER_LEVEL)

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(3)
    expect(events[0]).toMatchObject({ eventType: 'XPGranted', amount: 10 })
    expect(events[1]).toMatchObject({ eventType: 'LevelUp', previousLevel: 1, newLevel: 2 })
    expect(events[2]).toMatchObject({ eventType: 'AttributePointsGranted', points: ATTRIBUTE_POINTS_PER_LEVEL })
  })

  it('persists the updated experience through the repository', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })

    await buildUseCase().execute({ characterId: character.id, amount: 10, source: 'quest' })

    const stored = await characterRepository.findById(character.id)
    expect(stored?.experience).toBe(10)
  })

  it('throws NotFoundError when the character does not exist', async () => {
    await expect(
      buildUseCase().execute({ characterId: 'ghost-character', amount: 10, source: 'quest' })
    ).rejects.toThrow(NotFoundError)
  })
})
