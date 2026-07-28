import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CompleteQuestUseCase } from '../application/complete-quest'
import { calculateXpToNextLevel } from '../../progression/engines/level.engine'
import { GrantExperienceUseCase } from '../../progression/use-cases/grant-experience'
import { InMemoryProgressionRepository } from '../../progression/infrastructure/in-memory-progression-repository'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../../character/infrastructure/in-memory-character-rest-point-repository'
import type { DomainEvent } from '../../../shared/events/domain-event'

describe('CompleteQuestUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository
  let restPointRepository: InMemoryCharacterRestPointRepository
  let publishEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
    restPointRepository = new InMemoryCharacterRestPointRepository()
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  function buildUseCase() {
    const progressionRepository = new InMemoryProgressionRepository(characterRepository, restPointRepository)
    const grantExperience = new GrantExperienceUseCase(progressionRepository, publishEvent)
    return new CompleteQuestUseCase(questRepository, characterRepository, grantExperience, publishEvent)
  }

  it('grants XP and publishes QuestCompleted + XPGranted without leveling up', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', rewardXp: 10, type: 'main' })

    const result = await buildUseCase().execute({ userId: 'user-1', questId: quest.id })

    expect(result.quest.status).toBe('completed')
    expect(result.character.experience).toBe(10)
    expect(result.character.level).toBe(1)
    expect(result.renewedQuest).toBeNull()

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(2)
    expect(events[0]).toMatchObject({ eventType: 'QuestCompleted', questId: quest.id, characterId: character.id })
    expect(events[1]).toMatchObject({ eventType: 'XPGranted', characterId: character.id, amount: 10, source: 'quest' })
  })

  it('levels up and publishes LevelUp and AttributePointsGranted when enough XP is earned', async () => {
    const xpForLevel1 = calculateXpToNextLevel(1)
    const character = characterRepository.seed({
      userId: 'user-1',
      name: 'Hero',
      level: 1,
      experience: xpForLevel1 - 5,
    })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest', rewardXp: 10, type: 'main' })

    const result = await buildUseCase().execute({ userId: 'user-1', questId: quest.id })

    expect(result.character.level).toBe(2)
    expect(result.character.experience).toBe(5)

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(4)
    expect(events[0]).toMatchObject({ eventType: 'QuestCompleted' })
    expect(events[1]).toMatchObject({ eventType: 'XPGranted', amount: 10 })
    expect(events[2]).toMatchObject({ eventType: 'LevelUp', previousLevel: 1, newLevel: 2 })
    expect(events[3]).toMatchObject({ eventType: 'AttributePointsGranted', points: 5 })
  })

  it('gains multiple levels in a single completion when XP overflows more than one threshold', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })
    const hugeReward = calculateXpToNextLevel(1) + calculateXpToNextLevel(2) + 5
    const quest = questRepository.seed({
      characterId: character.id,
      title: 'Quest',
      rewardXp: hugeReward,
      type: 'main',
    })

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

  it('rejects completing a daily quest after its deadline', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const pastDeadline = new Date(Date.now() - 60 * 60 * 1000)
    const quest = questRepository.seed({
      characterId: character.id,
      title: 'Quest',
      type: 'daily',
      expiresAt: pastDeadline,
    })

    await expect(buildUseCase().execute({ userId: 'user-1', questId: quest.id })).rejects.toThrow(ConflictError)
    expect(publishEvent).not.toHaveBeenCalled()
  })

  it('rejects completing a main quest when 70% or fewer of its objectives are completed', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({
      characterId: character.id,
      title: 'Quest',
      type: 'main',
      objectives: [
        { id: 'obj-1', description: 'A', target: 1, current: 1, completed: true },
        { id: 'obj-2', description: 'B', target: 1, current: 0, completed: false },
        { id: 'obj-3', description: 'C', target: 1, current: 0, completed: false },
      ],
    })

    await expect(buildUseCase().execute({ userId: 'user-1', questId: quest.id })).rejects.toThrow(ValidationError)
    expect(publishEvent).not.toHaveBeenCalled()
  })

  it('allows completing a main quest when more than 70% of its objectives are completed', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({
      characterId: character.id,
      title: 'Quest',
      type: 'main',
      objectives: [
        { id: 'obj-1', description: 'A', target: 1, current: 1, completed: true },
        { id: 'obj-2', description: 'B', target: 1, current: 1, completed: true },
        { id: 'obj-3', description: 'C', target: 1, current: 1, completed: true },
        { id: 'obj-4', description: 'D', target: 1, current: 0, completed: false },
      ],
    })

    const result = await buildUseCase().execute({ userId: 'user-1', questId: quest.id })

    expect(result.quest.status).toBe('completed')
    expect(result.renewedQuest).toBeNull()
  })

  it('creates a renewed quest for the next day when a daily quest is completed', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({
      characterId: character.id,
      title: 'Daily Quest',
      type: 'daily',
      rewardXp: 10,
      rewardGold: 5,
      questRank: 'D',
      minLevel: 2,
      objectives: [{ id: 'obj-1', description: 'Do it', target: 3, current: 2, completed: false }],
    })

    const result = await buildUseCase().execute({ userId: 'user-1', questId: quest.id })

    expect(result.renewedQuest).not.toBeNull()
    expect(result.renewedQuest?.title).toBe('Daily Quest')
    expect(result.renewedQuest?.status).toBe('available')
    expect(result.renewedQuest?.rewardXp).toBe(10)
    expect(result.renewedQuest?.rewardGold).toBe(5)
    expect(result.renewedQuest?.questRank).toBe('D')
    expect(result.renewedQuest?.minLevel).toBe(2)
    expect(result.renewedQuest?.objectives).toHaveLength(1)
    expect(result.renewedQuest?.objectives[0]).toMatchObject({ current: 0, completed: false, target: 3 })

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    const renewalEvent = events.find((e) => e.eventType === 'DailyQuestRenewed')
    expect(renewalEvent).toMatchObject({
      previousQuestId: quest.id,
      newQuestId: result.renewedQuest?.id,
      characterId: character.id,
    })
  })
})
