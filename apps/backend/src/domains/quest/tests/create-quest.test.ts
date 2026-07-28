import { describe, it, expect, beforeEach } from 'vitest'
import { CreateQuestUseCase } from '../application/create-quest'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'

describe('CreateQuestUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
  })

  function seedCharacter(userId = 'user-1') {
    return characterRepository.seed({ userId, name: 'Sung Jinwoo' })
  }

  it('creates a daily quest defaulting the deadline to the end of the current day', async () => {
    seedCharacter()
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)
    const now = new Date()

    const result = await useCase.execute({
      userId: 'user-1',
      title: 'Train for 30 minutes',
      description: 'Spend 30 minutes training',
      questRank: 'Health',
      type: 'daily',
      rewardXp: 100,
    })

    expect(result.type).toBe('daily')
    expect(result.status).toBe('available')
    expect(result.expiresAt).not.toBeNull()
    expect(result.expiresAt!.toDateString()).toBe(now.toDateString())
    expect(result.expiresAt!.getHours()).toBe(23)
    expect(result.expiresAt!.getMinutes()).toBe(59)
  })

  it('persists the provided categoryId, defaulting to null when omitted', async () => {
    seedCharacter()
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    const withoutCategory = await useCase.execute({
      userId: 'user-1',
      title: 'Quest without category',
      description: 'Description',
      questRank: 'E',
      rewardXp: 10,
    })
    expect(withoutCategory.categoryId).toBeNull()

    const withCategory = await useCase.execute({
      userId: 'user-1',
      title: 'Quest with category',
      description: 'Description',
      questRank: 'E',
      type: 'main',
      categoryId: 'category-1',
      rewardXp: 10,
    })
    expect(withCategory.categoryId).toBe('category-1')
  })

  it('creates a main quest defaulting the deadline to 28 days from now', async () => {
    seedCharacter()
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)
    const before = Date.now()

    const result = await useCase.execute({
      userId: 'user-1',
      title: 'Defeat the Ant King',
      description: 'Clear the S-Rank dungeon',
      questRank: 'Combat',
      type: 'main',
      rewardXp: 250,
    })

    const expectedMs = before + 28 * 24 * 60 * 60 * 1000
    expect(result.expiresAt).not.toBeNull()
    expect(Math.abs(result.expiresAt!.getTime() - expectedMs)).toBeLessThan(5000)
  })

  it('respects an explicit deadline when provided', async () => {
    seedCharacter()
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)
    const customDeadline = new Date('2026-08-01T00:00:00.000Z')

    const result = await useCase.execute({
      userId: 'user-1',
      title: 'Custom deadline quest',
      description: 'Has an explicit deadline',
      questRank: 'Custom',
      type: 'main',
      rewardXp: 50,
      expiresAt: customDeadline,
    })

    expect(result.expiresAt).toEqual(customDeadline)
  })

  it.each(['side', 'weekly', 'event'] as const)(
    'rejects registering a "%s" quest for now',
    async (type) => {
      seedCharacter()
      const useCase = new CreateQuestUseCase(questRepository, characterRepository)

      await expect(
        useCase.execute({
          userId: 'user-1',
          title: 'Unsupported type',
          description: 'Should be rejected',
          questRank: 'General',
          type,
          rewardXp: 10,
        }),
      ).rejects.toThrow(ValidationError)
    },
  )

  it('rejects a quest created with 0 XP reward', async () => {
    seedCharacter()
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    await expect(
      useCase.execute({
        userId: 'user-1',
        title: 'No reward',
        description: 'Should be rejected',
        questRank: 'General',
        type: 'daily',
        rewardXp: 0,
      }),
    ).rejects.toThrow(ValidationError)
  })

  it('rejects a quest missing title, description or quest rank', async () => {
    seedCharacter()
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    await expect(
      useCase.execute({
        userId: 'user-1',
        title: '',
        description: 'Missing title',
        questRank: 'General',
        type: 'daily',
        rewardXp: 10,
      }),
    ).rejects.toThrow(ValidationError)
  })

  it('allows up to 3 active daily quests', async () => {
    const character = seedCharacter()
    questRepository.seed({ characterId: character.id, title: 'Daily 1', type: 'daily', status: 'available' })
    questRepository.seed({ characterId: character.id, title: 'Daily 2', type: 'daily', status: 'in_progress' })
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    const result = await useCase.execute({
      userId: 'user-1',
      title: 'Daily 3',
      description: 'Third daily quest',
      questRank: 'General',
      type: 'daily',
      rewardXp: 10,
    })

    expect(result.title).toBe('Daily 3')
  })

  it('rejects creating a 4th active daily quest', async () => {
    const character = seedCharacter()
    questRepository.seed({ characterId: character.id, title: 'Daily 1', type: 'daily', status: 'available' })
    questRepository.seed({ characterId: character.id, title: 'Daily 2', type: 'daily', status: 'in_progress' })
    questRepository.seed({ characterId: character.id, title: 'Daily 3', type: 'daily', status: 'available' })
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    await expect(
      useCase.execute({
        userId: 'user-1',
        title: 'Daily 4',
        description: 'Fourth daily quest',
        questRank: 'General',
        type: 'daily',
        rewardXp: 10,
      }),
    ).rejects.toThrow(ConflictError)
  })

  it('does not count completed, failed or expired daily quests toward the limit', async () => {
    const character = seedCharacter()
    questRepository.seed({ characterId: character.id, title: 'Daily 1', type: 'daily', status: 'completed' })
    questRepository.seed({ characterId: character.id, title: 'Daily 2', type: 'daily', status: 'failed' })
    questRepository.seed({ characterId: character.id, title: 'Daily 3', type: 'daily', status: 'expired' })
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    const result = await useCase.execute({
      userId: 'user-1',
      title: 'Daily 4',
      description: 'Should still be allowed',
      questRank: 'General',
      type: 'daily',
      rewardXp: 10,
    })

    expect(result.title).toBe('Daily 4')
  })

  it('does not apply the daily-quest limit to main quests', async () => {
    const character = seedCharacter()
    questRepository.seed({ characterId: character.id, title: 'Daily 1', type: 'daily', status: 'available' })
    questRepository.seed({ characterId: character.id, title: 'Daily 2', type: 'daily', status: 'available' })
    questRepository.seed({ characterId: character.id, title: 'Daily 3', type: 'daily', status: 'available' })
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    const result = await useCase.execute({
      userId: 'user-1',
      title: 'Main quest',
      description: 'Unaffected by the daily cap',
      questRank: 'General',
      type: 'main',
      rewardXp: 50,
    })

    expect(result.title).toBe('Main quest')
  })

  it('rejects creating a second active main quest in the same category', async () => {
    const character = seedCharacter()
    questRepository.seed({
      characterId: character.id,
      title: 'Existing main quest',
      type: 'main',
      status: 'available',
      categoryId: 'category-1',
    })
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    await expect(
      useCase.execute({
        userId: 'user-1',
        title: 'Another main quest',
        description: 'Same category',
        questRank: 'General',
        type: 'main',
        categoryId: 'category-1',
        rewardXp: 50,
      }),
    ).rejects.toThrow(ConflictError)
  })

  it('does not count completed, failed or expired main quests toward the per-category limit', async () => {
    const character = seedCharacter()
    questRepository.seed({
      characterId: character.id,
      title: 'Done main quest',
      type: 'main',
      status: 'completed',
      categoryId: 'category-1',
    })
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    const result = await useCase.execute({
      userId: 'user-1',
      title: 'New main quest',
      description: 'Same category, but the old one is done',
      questRank: 'General',
      type: 'main',
      categoryId: 'category-1',
      rewardXp: 50,
    })

    expect(result.title).toBe('New main quest')
  })

  it('allows a second active main quest in a different category', async () => {
    const character = seedCharacter()
    questRepository.seed({
      characterId: character.id,
      title: 'Existing main quest',
      type: 'main',
      status: 'available',
      categoryId: 'category-1',
    })
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    const result = await useCase.execute({
      userId: 'user-1',
      title: 'Another main quest',
      description: 'Different category',
      questRank: 'General',
      type: 'main',
      categoryId: 'category-2',
      rewardXp: 50,
    })

    expect(result.title).toBe('Another main quest')
  })

  it('allows main quests without a category regardless of other main quests', async () => {
    const character = seedCharacter()
    questRepository.seed({ characterId: character.id, title: 'Existing main quest', type: 'main', status: 'available' })
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    const result = await useCase.execute({
      userId: 'user-1',
      title: 'Another main quest',
      description: 'No category on either quest',
      questRank: 'General',
      type: 'main',
      rewardXp: 50,
    })

    expect(result.title).toBe('Another main quest')
  })

  it('throws NotFoundError when the user has no character', async () => {
    const useCase = new CreateQuestUseCase(questRepository, characterRepository)

    await expect(
      useCase.execute({
        userId: 'ghost-user',
        title: 'Orphan quest',
        description: 'No character',
        questRank: 'General',
        type: 'daily',
        rewardXp: 10,
      }),
    ).rejects.toThrow(NotFoundError)
  })
})
