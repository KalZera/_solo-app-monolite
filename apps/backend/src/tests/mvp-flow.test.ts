// End-to-end coverage of the MVP user journey, wiring real use cases from every domain
// together (identity, character, quest, progression) against their in-memory repositories.
// Unlike the per-use-case unit tests, this file's purpose is to prove the rules hold when
// exercised together, the way an actual user session would.
import { describe, it, expect, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { RegisterUserUseCase } from '../domains/identity/application/register-user'
import { LoginUserUseCase } from '../domains/identity/application/login-user'
import { InMemoryPrisma } from '../domains/identity/infrastructure/in-memory-prisma'
import { CreateCharacterUseCase } from '../domains/character/application/create-character'
import { AllocateAttributePointUseCase } from '../domains/character/application/allocate-attribute-point'
import { InMemoryCharacterRepository } from '../domains/character/infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../domains/character/infrastructure/in-memory-character-rest-point-repository'
import { CreateQuestUseCase } from '../domains/quest/application/create-quest'
import { CompleteQuestUseCase } from '../domains/quest/application/complete-quest'
import { ExpireQuestsUseCase } from '../domains/quest/application/expire-quests'
import { InMemoryQuestRepository } from '../domains/quest/infrastructure/in-memory-quest-repository'
import { InMemoryProgressionRepository } from '../domains/progression/infrastructure/in-memory-progression-repository'
import { GrantExperienceUseCase } from '../domains/progression/use-cases/grant-experience'
import { calculateXpToNextLevel } from '../domains/progression/engines/level.engine'
import { ConflictError } from '../shared/errors/app-error'
import type { DomainEvent } from '../shared/events/domain-event'

describe('MVP user journey', () => {
  const prisma = new InMemoryPrisma()
  const characterRepository = new InMemoryCharacterRepository()
  const restPointRepository = new InMemoryCharacterRestPointRepository()
  const questRepository = new InMemoryQuestRepository()
  const progressionRepository = new InMemoryProgressionRepository(characterRepository, restPointRepository)
  const publishEvent = vi.fn().mockResolvedValue(undefined)

  const registerUser = new RegisterUserUseCase(prisma as unknown as PrismaClient)
  const loginUser = new LoginUserUseCase(
    prisma as unknown as PrismaClient,
    () => 'fake-access-token',
    () => 'fake-refresh-token'
  )
  const createCharacter = new CreateCharacterUseCase(characterRepository, restPointRepository)
  const createQuest = new CreateQuestUseCase(questRepository, characterRepository)
  const grantExperience = new GrantExperienceUseCase(progressionRepository, publishEvent)
  const completeQuest = new CompleteQuestUseCase(questRepository, characterRepository, grantExperience, publishEvent)
  const allocateAttributePoint = new AllocateAttributePointUseCase(characterRepository, restPointRepository, publishEvent)
  const expireQuests = new ExpireQuestsUseCase(questRepository, publishEvent)

  const HUNTER = { email: 'jinwoo@solo.com', username: 'jinwoo', password: 'arise-1234' }
  let userId: string
  let characterId: string

  it('registers a new hunter', async () => {
    const user = await registerUser.execute(HUNTER)

    expect(user.email).toBe(HUNTER.email)
    expect(user.username).toBe(HUNTER.username)
    userId = user.id
  })

  it('logs the hunter into the app', async () => {
    const session = await loginUser.execute({ email: HUNTER.email, password: HUNTER.password })

    expect(session.access_token).toBe('fake-access-token')
    expect(session.refresh_token).toBe('fake-refresh-token')
  })

  it('creates a character for the logged-in user', async () => {
    const character = await createCharacter.execute({
      userId,
      name: 'Sung Jinwoo',
      class: 'warrior',
      title: 'The Weakest Hunter',
    })

    expect(character.level).toBe(1)
    expect(character.stats).toEqual({ strength: 1, intelligence: 1, agility: 1, vitality: 1, luck: 1 })
    characterId = character.id
  })

  it('does not allow the user to register a second character', async () => {
    await expect(
      createCharacter.execute({ userId, name: 'Another Hunter', class: 'mage', title: 'Second Character' })
    ).rejects.toThrow(ConflictError)
  })

  describe('quest creation limits', () => {
    it('allows up to 5 active daily quests but rejects the 6th', async () => {
      for (let i = 1; i <= 5; i++) {
        const quest = await createQuest.execute({
          userId,
          title: `Daily quest ${i}`,
          description: 'Train for 30 minutes',
          questRank: 'E',
          type: 'daily',
          rewardXp: 10,
        })
        expect(quest.status).toBe('available')
      }

      await expect(
        createQuest.execute({
          userId,
          title: 'Daily quest 6',
          description: 'One too many',
          questRank: 'E',
          type: 'daily',
          rewardXp: 10,
        })
      ).rejects.toThrow(ConflictError)
    })

    it('allows only one active main quest per category', async () => {
      const firstDungeon = await createQuest.execute({
        userId,
        title: 'Clear the Double Dungeon',
        description: 'Defeat the boss on the hidden floor',
        questRank: 'A',
        type: 'main',
        categoryId: 'combat',
        rewardXp: 250,
      })
      expect(firstDungeon.categoryId).toBe('combat')

      await expect(
        createQuest.execute({
          userId,
          title: 'Another combat quest',
          description: 'Same category as an already active main quest',
          questRank: 'A',
          type: 'main',
          categoryId: 'combat',
          rewardXp: 250,
        })
      ).rejects.toThrow(ConflictError)

      const differentCategoryQuest = await createQuest.execute({
        userId,
        title: 'Study a new language',
        description: 'A main quest in a different category',
        questRank: 'B',
        type: 'main',
        categoryId: 'intellect',
        rewardXp: 250,
      })
      expect(differentCategoryQuest.categoryId).toBe('intellect')
    })
  })

  it('completes a quest, grants XP, and levels up crediting 5 rest points to spend', async () => {
    const xpForLevel1 = calculateXpToNextLevel(1)
    const levelUpQuest = await createQuest.execute({
      userId,
      title: 'A trial worth a level',
      description: 'Rewards exactly enough XP to level up once',
      questRank: 'S',
      type: 'main',
      categoryId: 'trial',
      rewardXp: xpForLevel1,
    })

    const result = await completeQuest.execute({ userId, questId: levelUpQuest.id })

    expect(result.quest.status).toBe('completed')
    expect(result.quest.completedAt).toBeInstanceOf(Date)
    expect(result.levelsGained).toEqual([2])
    expect(result.character.level).toBe(2)

    const restPoint = await restPointRepository.findByCharacterId(characterId)
    expect(restPoint?.restPoints).toBe(5)
  })

  it('lets the hunter spend all 5 level-up points on a single attribute', async () => {
    const beforeStrength = (await characterRepository.findById(characterId))!.stats.strength

    const { character, restPoints } = await allocateAttributePoint.execute({
      userId,
      attribute: 'strength',
      amount: 5,
    })

    expect(character.stats.strength).toBe(beforeStrength + 5)
    expect(restPoints).toBe(0)
  })

  it('fails a quest and emits QuestExpired once its deadline has passed', async () => {
    const overdueQuest = questRepository.seed({
      characterId,
      title: 'Forgotten daily quest',
      type: 'daily',
      status: 'available',
      expiresAt: new Date(Date.now() - 60 * 60 * 1000),
    })
    publishEvent.mockClear()

    const failedQuests = await expireQuests.execute()
    const failedQuest = failedQuests.find((quest) => quest.id === overdueQuest.id)

    expect(failedQuest?.status).toBe('failed')

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toContainEqual(
      expect.objectContaining({ eventType: 'QuestExpired', questId: overdueQuest.id, characterId })
    )
  })
})
