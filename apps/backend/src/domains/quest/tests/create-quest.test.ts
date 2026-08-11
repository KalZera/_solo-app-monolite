import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CreateQuestUseCase } from '../application/create-quest'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryQuestInstanceRepository } from '../infrastructure/in-memory-quest-instance-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import type { Recurrence } from '../domain/recurrence'
import { MAX_ACTIVE_DAILY_QUESTS } from '../domain/quest'

describe('CreateQuestUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository
  let questInstanceRepository: InMemoryQuestInstanceRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
    questInstanceRepository = new InMemoryQuestInstanceRepository()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function seedCharacter (userId = 'user-1') {
    return characterRepository.seed({ userId, name: 'Sung Jinwoo' })
  }

  function build () {
    return new CreateQuestUseCase(questRepository, characterRepository, questInstanceRepository)
  }

  it('creates a template with XP derived from the rank (no instances created)', async () => {
    const character = seedCharacter()

    const {quest} = await build().execute({
      userId: 'user-1',
      title: 'Academia',
      description: 'Treinar',
      rank: 'A',
      recurrence: 'DAILY',
    })

    expect(quest.characterId).toBe(character.id)
    expect(quest.recurrence).toBe('DAILY')
    expect(quest.rank).toBe('A')
    expect(quest.rewardXp).toBe(250)
    expect(quest.active).toBe(true)
  })

  it('defaults the recurrence to NONE when omitted', async () => {
    seedCharacter()
    const {quest} = await build().execute({ userId: 'user-1', title: 'Ler', description: 'Um livro', rank: 'E' })
    expect(quest.recurrence).toBe('NONE')
    expect(quest.deadlineDate).not.toBeNull()
  })

  it('normalises the provided deadlineDate to 23:59:59.999 UTC of that day, for the template and the instance', async () => {
    seedCharacter()
    const deadlineDate = new Date('2026-08-10T12:00:00.000Z')
    const {quest, instance} = await build().execute({
      userId: 'user-1',
      title: 'Ler',
      description: 'Um livro',
      rank: 'E',
      recurrence: 'NONE',
      deadlineDate,
    })

    expect(quest.deadlineDate).toEqual(new Date('2026-08-10T23:59:59.999Z'))
    expect(instance.deadline).toEqual(new Date('2026-08-10T23:59:59.999Z'))
  })

  it('creates exactly one instance for a NONE-recurrence quest', async () => {
    seedCharacter()
    const {quest} = await build().execute({
      userId: 'user-1',
      title: 'Ler',
      description: 'Um livro',
      rank: 'E',
      recurrence: 'NONE',
    })

    expect(await questInstanceRepository.findByQuestId(quest.id)).toHaveLength(1)
  })

  it('defaults deadlineDate to 24 hours from now (still normalised to 23:59:59.999 UTC) when none is provided', async () => {
    seedCharacter()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-10T15:30:00.000Z'))

    const {quest} = await build().execute({
      userId: 'user-1',
      title: 'Ler',
      description: 'Um livro',
      rank: 'E',
      recurrence: 'NONE',
    })

    expect(quest.deadlineDate).toEqual(new Date('2026-08-11T23:59:59.999Z'))
  })

  it('copies objectives into the template blueprint', async () => {
    seedCharacter()
    const {quest} = await build().execute({
      userId: 'user-1',
      title: 'Estudar',
      description: 'Inglês',
      rank: 'C',
      objectives: [{ description: 'Ouvir', target: 2 }],
    })
    expect(quest.objectiveTemplates).toHaveLength(1)
    expect(quest.objectiveTemplates[0]).toMatchObject({ description: 'Ouvir', target: 2 })
    expect(quest.objectiveTemplates[0].id).toBeTruthy()
  })

  it('rejects an invalid rank', async () => {
    seedCharacter()
    await expect(
      build().execute({ userId: 'user-1', title: 'X', description: 'Y', rank: 'General' })
    ).rejects.toThrow(ValidationError)
  })

  it('rejects an invalid recurrence', async () => {
    seedCharacter()
    await expect(
      build().execute({ userId: 'user-1', title: 'X', description: 'Y', rank: 'E', recurrence: 'HOURLY' as Recurrence })
    ).rejects.toThrow(ValidationError)
  })

  it('rejects a quest missing a title or description', async () => {
    seedCharacter()
    await expect(build().execute({ userId: 'user-1', title: '', description: 'Y', rank: 'E' })).rejects.toThrow(
      ValidationError
    )
  })

  it("rejects a daily quest when MAX daily quests created ", async () => {
    seedCharacter();
    const requests = []
    for (let index = 1; index <= MAX_ACTIVE_DAILY_QUESTS; index++) {
      console.log({index})
      requests.push(
        build().execute({
        userId: `user-1`,
        title: `daily ${index}`,
        description: `daily ${index}`,
        rank: "E",
        recurrence: "DAILY",
      }),
      )
    }
    console.log({requests})
    await Promise.all(requests);

    await expect(
      build().execute({
        userId: "user-1",
        title: "daily max",
        description: "daily max",
        rank: "E",
        recurrence: "DAILY",
      }),
    ).rejects.toThrowError(ConflictError);
  });

  it('throws NotFoundError when the user has no character', async () => {
    await expect(
      build().execute({ userId: 'ghost', title: 'X', description: 'Y', rank: 'E' })
    ).rejects.toThrow(NotFoundError)
  })
})
