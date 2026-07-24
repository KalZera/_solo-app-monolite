import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CompleteQuestUseCase } from '../application/complete-quest'
import { calculateXpToNextLevel } from '../../character/domain/character'
import { ConflictError, NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import type { DomainEvent } from '../../../shared/events/domain-event'

describe('CompleteQuestUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository
  let publishEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  function buildUseCase() {
    return new CompleteQuestUseCase(questRepository, characterRepository, publishEvent)
  }

  it('grants XP and publishes XPGranted without leveling up', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', rewardXp: 10 })

    const result = await buildUseCase().execute({ userId: 'user-1', questId: quest.id })

    expect(result.quest.status).toBe('completed')
    expect(result.character.experience).toBe(10)
    expect(result.character.level).toBe(1)

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ eventType: 'XPGranted', characterId: character.id, amount: 10, source: 'quest' })
  })

  it('levels up and publishes LevelUp and AttributePointsGranted when enough XP is earned', async () => {
    const xpForLevel1 = calculateXpToNextLevel(1)
    const character = characterRepository.seed({
      userId: 'user-1',
      name: 'Hero',
      level: 1,
      experience: xpForLevel1 - 5,
    })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', rewardXp: 10 })

    const result = await buildUseCase().execute({ userId: 'user-1', questId: quest.id })

    expect(result.character.level).toBe(2)
    expect(result.character.experience).toBe(5)

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(3)
    expect(events[0]).toMatchObject({ eventType: 'XPGranted', amount: 10 })
    expect(events[1]).toMatchObject({ eventType: 'LevelUp', previousLevel: 1, newLevel: 2 })
    expect(events[2]).toMatchObject({ eventType: 'AttributePointsGranted', points: 5 })
  })

  it('gains multiple levels in a single completion when XP overflows more than one threshold', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })
    const hugeReward = calculateXpToNextLevel(1) + calculateXpToNextLevel(2) + 5
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', rewardXp: hugeReward })

    const result = await buildUseCase().execute({ userId: 'user-1', questId: quest.id })

    expect(result.character.level).toBe(3)
    expect(result.character.experience).toBe(5)

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    const levelUpEvents = events.filter((e) => e.eventType === 'LevelUp')
    const attributeEvents = events.filter((e) => e.eventType === 'AttributePointsGranted')
    expect(levelUpEvents).toHaveLength(2)
    expect(attributeEvents).toHaveLength(2)
  })

  it('rejects completing a quest that is already completed', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', status: 'completed' })

    await expect(buildUseCase().execute({ userId: 'user-1', questId: quest.id })).rejects.toThrow(ConflictError)
    expect(publishEvent).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when completing a quest owned by a different character', async () => {
    const characterA = characterRepository.seed({ userId: 'user-1', name: 'Hero A' })
    characterRepository.seed({ userId: 'user-2', name: 'Hero B' })
    const quest = questRepository.seed({ characterId: characterA.id, title: 'Quest A' })

    await expect(buildUseCase().execute({ userId: 'user-2', questId: quest.id })).rejects.toThrow(NotFoundError)
  })
})
