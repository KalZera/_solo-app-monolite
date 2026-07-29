import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CompleteQuestObjectiveUseCase } from '../application/complete-quest-objective'
import { ConflictError, NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import type { DomainEvent } from '../../../shared/events/domain-event'

describe('CompleteQuestObjectiveUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository
  let publishEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  function buildUseCase() {
    return new CompleteQuestObjectiveUseCase(questRepository, characterRepository, publishEvent)
  }

  it('marks the objective as completed and publishes QuestObjectiveCompleted', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({
      characterId: character.id,
      title: 'Learn TypeScript',
      objectives: [
        { id: 'obj-1', description: 'Read the docs', target: 1, current: 0, completed: false },
        { id: 'obj-2', description: 'Write a project', target: 1, current: 0, completed: false },
      ],
    })

    const result = await buildUseCase().execute({ userId: 'user-1', questId: quest.id, objectiveId: 'obj-1' })

    const updatedObjective = result.quest.objectives.find((o) => o.id === 'obj-1')
    expect(updatedObjective).toMatchObject({ completed: true, current: 1 })
    const untouchedObjective = result.quest.objectives.find((o) => o.id === 'obj-2')
    expect(untouchedObjective).toMatchObject({ completed: false, current: 0 })

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      eventType: 'QuestObjectiveCompleted',
      questId: quest.id,
      objectiveId: 'obj-1',
      characterId: character.id,
      questTitle: 'Learn TypeScript',
      objectiveDescription: 'Read the docs',
    })
  })

  it('throws NotFoundError when the objective does not belong to the quest', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Quest' })

    await expect(
      buildUseCase().execute({ userId: 'user-1', questId: quest.id, objectiveId: 'missing' }),
    ).rejects.toThrow(NotFoundError)
    expect(publishEvent).not.toHaveBeenCalled()
  })

  it('rejects completing an objective that was already completed', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({
      characterId: character.id,
      title: 'Quest',
      objectives: [{ id: 'obj-1', description: 'Do it', target: 1, current: 1, completed: true }],
    })

    await expect(buildUseCase().execute({ userId: 'user-1', questId: quest.id, objectiveId: 'obj-1' })).rejects.toThrow(
      ConflictError,
    )
    expect(publishEvent).not.toHaveBeenCalled()
  })

  it('rejects completing an objective on an already completed quest', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({
      characterId: character.id,
      title: 'Quest',
      status: 'completed',
      objectives: [{ id: 'obj-1', description: 'Do it', target: 1, current: 0, completed: false }],
    })

    await expect(buildUseCase().execute({ userId: 'user-1', questId: quest.id, objectiveId: 'obj-1' })).rejects.toThrow(
      ConflictError,
    )
    expect(publishEvent).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when completing an objective on a quest owned by a different character', async () => {
    const characterA = characterRepository.seed({ userId: 'user-1', name: 'Hero A' })
    characterRepository.seed({ userId: 'user-2', name: 'Hero B' })
    const quest = questRepository.seed({
      characterId: characterA.id,
      title: 'Quest A',
      objectives: [{ id: 'obj-1', description: 'Do it', target: 1, current: 0, completed: false }],
    })

    await expect(buildUseCase().execute({ userId: 'user-2', questId: quest.id, objectiveId: 'obj-1' })).rejects.toThrow(
      NotFoundError,
    )
  })
})
