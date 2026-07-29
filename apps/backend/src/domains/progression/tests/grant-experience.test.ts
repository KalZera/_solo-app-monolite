import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GrantExperienceUseCase } from '../use-cases/grant-experience'
import { InMemoryProgressionRepository } from '../infrastructure/in-memory-progression-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../../character/infrastructure/in-memory-character-rest-point-repository'
import { calculateXpToNextLevel } from '../engines/level.engine'
import { ATTRIBUTE_POINTS_PER_LEVEL } from '../engines/attribute.engine'
import { NotFoundError } from '../../../shared/errors/app-error'
import type { DomainEvent } from '../../../shared/events/domain-event'

describe('GrantExperienceUseCase', () => {
  let characterRepository: InMemoryCharacterRepository
  let restPointRepository: InMemoryCharacterRestPointRepository
  let progressionRepository: InMemoryProgressionRepository
  let publishEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    restPointRepository = new InMemoryCharacterRestPointRepository()
    progressionRepository = new InMemoryProgressionRepository(characterRepository, restPointRepository)
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  function buildUseCase () {
    return new GrantExperienceUseCase(progressionRepository, publishEvent)
  }

  it('grants XP and publishes only XPGranted without leveling up', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })

    const result = await buildUseCase().execute({ characterId: character.id, amount: 10, source: 'quest' })

    expect(result.progression).toEqual({
      characterId: character.id,
      level: 1,
      experience: 10,
      stats: { strength: 1, intelligence: 1, agility: 1, vitality: 1, luck: 1 },
      powerScore: 5,
    })
    expect(result.levelsGained).toEqual([])

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ eventType: 'XPGranted', characterId: character.id, amount: 10, source: 'quest' })
  })

  it('levels up and publishes LevelUp + AttributePointsGranted', async () => {
    const xpForLevel1 = calculateXpToNextLevel(1)
    const character = characterRepository.seed({
      userId: 'user-1',
      name: 'Hero',
      level: 1,
      experience: xpForLevel1 - 5,
    })

    const result = await buildUseCase().execute({ characterId: character.id, amount: 10, source: 'quest' })

    expect(result.progression.level).toBe(2)
    expect(result.progression.experience).toBe(5)
    expect(result.levelsGained).toEqual([2])

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(3)
    expect(events[0]).toMatchObject({ eventType: 'XPGranted', amount: 10 })
    expect(events[1]).toMatchObject({ eventType: 'LevelUp', previousLevel: 1, newLevel: 2 })
    expect(events[2]).toMatchObject({ eventType: 'AttributePointsGranted', points: ATTRIBUTE_POINTS_PER_LEVEL })
  })

  it('persists the updated level and experience through the repository', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })

    await buildUseCase().execute({ characterId: character.id, amount: 10, source: 'quest' })

    const stored = await characterRepository.findById(character.id)
    expect(stored?.experience).toBe(10)
    expect(stored?.level).toBe(1)
  })

  it('throws NotFoundError when the character does not exist', async () => {
    await expect(
      buildUseCase().execute({ characterId: 'ghost-character', amount: 10, source: 'quest' })
    ).rejects.toThrow(NotFoundError)
  })

  it('grants 5 rest points and +1 to every attribute automatically on level up', async () => {
    const xpForLevel1 = calculateXpToNextLevel(1)
    const character = characterRepository.seed({
      userId: 'user-1',
      name: 'Hero',
      level: 1,
      experience: xpForLevel1 - 5,
    })

    const result = await buildUseCase().execute({ characterId: character.id, amount: 10, source: 'quest' })

    expect(result.progression.stats).toEqual({
      strength: 2,
      intelligence: 2,
      agility: 2,
      vitality: 2,
      luck: 2,
    })
    expect(result.progression.powerScore).toBe(10)

    const restPoints = await restPointRepository.findByCharacterId(character.id)
    expect(restPoints?.restPoints).toBe(5)
  })

  it('grants rest points and attributes proportionally to how many levels were gained', async () => {
    const hugeGain = calculateXpToNextLevel(1) + calculateXpToNextLevel(2) + 5
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })

    const result = await buildUseCase().execute({ characterId: character.id, amount: hugeGain, source: 'quest' })

    expect(result.levelsGained).toEqual([2, 3])
    expect(result.progression.stats).toEqual({
      strength: 3,
      intelligence: 3,
      agility: 3,
      vitality: 3,
      luck: 3,
    })

    const restPoints = await restPointRepository.findByCharacterId(character.id)
    expect(restPoints?.restPoints).toBe(10)
  })

  it('does not grant rest points or attributes when no level is gained', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })

    await buildUseCase().execute({ characterId: character.id, amount: 10, source: 'quest' })

    const restPoints = await restPointRepository.findByCharacterId(character.id)
    expect(restPoints).toBeNull()
  })
})
