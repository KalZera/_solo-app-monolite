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
import { AllocateAttributePointsUseCase } from '../domains/character/application/allocate-attribute-points'
import { InMemoryCharacterRepository } from '../domains/character/infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../domains/character/infrastructure/in-memory-character-rest-point-repository'
import { CreateQuestUseCase } from '../domains/quest/application/create-quest'
import { GetTodayQuestsUseCase } from '../domains/quest/application/get-today-quests'
import { StartQuestUseCase } from '../domains/quest/application/start-quest'
import { CompleteQuestUseCase } from '../domains/quest/application/complete-quest'
import { ExpireQuestsUseCase } from '../domains/quest/application/expire-quests'
import { InMemoryQuestRepository } from '../domains/quest/infrastructure/in-memory-quest-repository'
import { InMemoryQuestInstanceRepository } from '../domains/quest/infrastructure/in-memory-quest-instance-repository'
import { InMemoryProgressionRepository } from '../domains/progression/infrastructure/in-memory-progression-repository'
import { GrantExperienceUseCase } from '../domains/progression/application/grant-experience'
import { calculateXpToNextLevel } from '../domains/progression/engines/level.engine'
import { ConflictError } from '../shared/errors/app-error'
import type { DomainEvent } from '../shared/events/domain-event'

describe('MVP user journey', () => {
  const prisma = new InMemoryPrisma()
  const characterRepository = new InMemoryCharacterRepository()
  const restPointRepository = new InMemoryCharacterRestPointRepository()
  const questRepository = new InMemoryQuestRepository()
  const questInstanceRepository = new InMemoryQuestInstanceRepository()
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
  const getTodayQuests = new GetTodayQuestsUseCase(
    questRepository,
    characterRepository,
    questInstanceRepository,
    undefined,
    publishEvent
  )
  const startQuest = new StartQuestUseCase(questInstanceRepository, questRepository, characterRepository, publishEvent)
  const grantExperience = new GrantExperienceUseCase(progressionRepository, publishEvent)
  const completeQuest = new CompleteQuestUseCase(
    questInstanceRepository,
    questRepository,
    characterRepository,
    grantExperience,
    publishEvent
  )
  const allocateAttributePoints = new AllocateAttributePointsUseCase(characterRepository, restPointRepository, publishEvent)
  const expireQuests = new ExpireQuestsUseCase(questInstanceRepository, questRepository, publishEvent)

  const HUNTER = { email: 'jinwoo@solo.com', username: 'jinwoo', password: 'arise-1234' }
  let userId: string
  let characterId: string
  let dailyQuestId: string
  let dailyInstanceId: string

  it('registers a new hunter', async () => {
    const user = await registerUser.execute(HUNTER)
    expect(user.email).toBe(HUNTER.email)
    userId = user.id
  })

  it('logs the hunter into the app', async () => {
    const session = await loginUser.execute({ email: HUNTER.email, password: HUNTER.password })
    expect(session.access_token).toBe('fake-access-token')
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

  it('creates a DAILY quest TEMPLATE (no execution is created)', async () => {
    const quest = await createQuest.execute({
      userId,
      title: 'Academia',
      description: 'Train for 30 minutes',
      rank: 'E',
      recurrence: 'DAILY',
    })

    expect(quest.recurrence).toBe('DAILY')
    expect(quest.rewardXp).toBe(10)
    dailyQuestId = quest.id
    expect(await questInstanceRepository.findByQuestId(dailyQuestId)).toHaveLength(0)
  })

  it("materialises today's instance on demand (idempotently)", async () => {
    const first = await getTodayQuests.execute({ userId })
    const instance = first.find((candidate) => candidate.questId === dailyQuestId)
    expect(instance).toBeDefined()
    expect(instance!.status).toBe('PENDING')
    dailyInstanceId = instance!.id

    // Second call reuses the same instance — never duplicated.
    await getTodayQuests.execute({ userId })
    expect(await questInstanceRepository.findByQuestId(dailyQuestId)).toHaveLength(1)
  })

  it('starts and completes the instance, granting rank-E XP', async () => {
    const started = await startQuest.execute({ userId, questInstanceId: dailyInstanceId })
    expect(started.instance.status).toBe('STARTED')

    const result = await completeQuest.execute({ userId, questInstanceId: dailyInstanceId })
    expect(result.instance.status).toBe('COMPLETED')
    expect(result.instance.rewardGranted).toBe(true)
    expect(result.character.experience).toBe(10)
  })

  it('levels up crediting 5 rest points when a big-reward instance is completed', async () => {
    const xpForLevel1 = calculateXpToNextLevel(1)
    // Seed a template + instance with an exact XP reward so the level-up is deterministic.
    const trialQuest = questRepository.seed({
      characterId,
      title: 'A trial worth a level',
      recurrence: 'NONE',
      rank: 'S',
      rewardXp: xpForLevel1,
    })
    const trialInstance = questInstanceRepository.seed({ questId: trialQuest.id, status: 'PENDING', objectives: [] })

    const result = await completeQuest.execute({ userId, questInstanceId: trialInstance.id })

    expect(result.levelsGained).toEqual([2])
    expect(result.character.level).toBe(2)

    const restPoint = await restPointRepository.findByCharacterId(characterId)
    expect(restPoint?.restPoints).toBe(5)
  })

  it('lets the hunter spend all 5 level-up points on a single attribute', async () => {
    const beforeStrength = (await characterRepository.findById(characterId))!.stats.strength

    const { character, restPoints } = await allocateAttributePoints.execute({
      userId,
      allocations: { strength: 5 },
    })

    expect(character.stats.strength).toBe(beforeStrength + 5)
    expect(restPoints).toBe(0)
  })

  it('fails an overdue PENDING instance and emits QuestFailed (no XP)', async () => {
    const overdueQuest = questRepository.seed({ characterId, title: 'Forgotten daily quest' })
    const overdueInstance = questInstanceRepository.seed({
      questId: overdueQuest.id,
      status: 'PENDING',
      deadline: new Date(Date.now() - 60 * 60 * 1000),
    })
    publishEvent.mockClear()

    const failed = await expireQuests.execute()

    expect(failed.find((instance) => instance.id === overdueInstance.id)?.status).toBe('FAILED')

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toContainEqual(
      expect.objectContaining({ eventType: 'QuestFailed', questInstanceId: overdueInstance.id, characterId })
    )
    expect(events.some((event) => event.eventType === 'XPGranted')).toBe(false)
  })
})
