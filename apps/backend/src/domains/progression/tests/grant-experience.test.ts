import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GrantExperienceUseCase } from '../use-cases/grant-experience'
import { InMemoryProgressionRepository } from '../infrastructure/in-memory-progression-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import { calculateXpToNextLevel } from '../engines/level.engine'
import { ATTRIBUTE_POINTS_PER_LEVEL } from '../engines/attribute.engine'
import { NotFoundError } from '../../../shared/errors/app-error'
import type { DomainEvent } from '../../../shared/events/domain-event'

describe('GrantExperienceUseCase', () => {
  let characterRepository: InMemoryCharacterRepository
  let progressionRepository: InMemoryProgressionRepository
  let publishEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    progressionRepository = new InMemoryProgressionRepository(characterRepository)
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  function buildUseCase() {
    return new GrantExperienceUseCase(progressionRepository, publishEvent)
  }

  it('grants XP and publishes only XPGranted without leveling up', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })

    const result = await buildUseCase().execute({ characterId: character.id, amount: 10, source: 'quest' })

    expect(result.progression).toEqual({ characterId: character.id, level: 1, experience: 10 })
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
      buildUseCase().execute({ characterId: 'ghost-character', amount: 10, source: 'quest' }),
    ).rejects.toThrow(NotFoundError)
  })
})
