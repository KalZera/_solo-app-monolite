import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CompleteQuestUseCase } from '../application/complete-quest'
import { GrantExperienceUseCase } from '../../progression/application/grant-experience'
import { ApplyLevelUpUseCase } from '../../progression/application/apply-level-up'
import { InMemoryProgressionRepository } from '../../progression/infrastructure/in-memory-progression-repository'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryQuestInstanceRepository } from '../infrastructure/in-memory-quest-instance-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../../character/infrastructure/in-memory-character-rest-point-repository'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import type { DomainEvent } from '../../../shared/events/domain-event'
import type { QuestInstanceObjective, QuestInstanceStatus } from '../domain/quest-instance'

function objective (completed: boolean, id: string): QuestInstanceObjective {
  return { id, description: id, target: 1, current: completed ? 1 : 0, completed }
}

describe('CompleteQuestUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let questInstanceRepository: InMemoryQuestInstanceRepository
  let characterRepository: InMemoryCharacterRepository
  let restPointRepository: InMemoryCharacterRestPointRepository
  let publishEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    questInstanceRepository = new InMemoryQuestInstanceRepository()
    characterRepository = new InMemoryCharacterRepository()
    restPointRepository = new InMemoryCharacterRestPointRepository()
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  function build () {
    const progressionRepository = new InMemoryProgressionRepository(characterRepository, restPointRepository)
    const applyLevelUp = new ApplyLevelUpUseCase(progressionRepository)
    const grantExperience = new GrantExperienceUseCase(characterRepository, applyLevelUp, undefined, publishEvent)
    return new CompleteQuestUseCase(
      questInstanceRepository,
      questRepository,
      characterRepository,
      grantExperience,
      publishEvent
    )
  }

  function events () {
    return publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
  }

  it('completes the instance, grants XP and publishes QuestCompleted + XPGranted', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero', level: 1, experience: 0 })
    const quest = questRepository.seed({ characterId: character.id, title: 'Academia', rank: 'E', rewardXp: 10 })
    const instance = questInstanceRepository.seed({ questId: quest.id, status: 'PENDING', objectives: [] })

    const result = await build().execute({ userId: 'user-1', questInstanceId: instance.id })

    expect(result.instance.status).toBe('COMPLETED')
    expect(result.instance.rewardGranted).toBe(true)
    expect(result.instance.progress).toBe(100)
    expect(result.instance.completedAt).toBeInstanceOf(Date)
    expect(result.character.experience).toBe(10)

    expect(events().find((event) => event.eventType === 'QuestCompleted')).toMatchObject({
      questInstanceId: instance.id,
      characterId: character.id,
      rewardXp: 10,
    })
    expect(events().find((event) => event.eventType === 'XPGranted')).toMatchObject({ amount: 10, source: 'quest' })
  })

  it.each(['COMPLETED', 'FAILED', 'EXPIRED'] as const)(
    'rejects completing an instance already %s (immutable / no revert)',
    async (status: QuestInstanceStatus) => {
      const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
      const quest = questRepository.seed({ characterId: character.id, title: 'Academia' })
      const instance = questInstanceRepository.seed({ questId: quest.id, status })

      await expect(build().execute({ userId: 'user-1', questInstanceId: instance.id })).rejects.toThrow(ConflictError)
      expect(publishEvent).not.toHaveBeenCalled()
    }
  )

  it('rejects completing when 70% or fewer of the objectives are done', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    const quest = questRepository.seed({ characterId: character.id, title: 'Academia' })
    const instance = questInstanceRepository.seed({
      questId: quest.id,
      status: 'STARTED',
      objectives: [objective(true, 'a'), objective(false, 'b'), objective(false, 'c')],
    })

    await expect(build().execute({ userId: 'user-1', questInstanceId: instance.id })).rejects.toThrow(ValidationError)
    expect(publishEvent).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when completing an instance owned by a different character', async () => {
    const characterA = characterRepository.seed({ userId: 'user-1', name: 'Hero A' })
    characterRepository.seed({ userId: 'user-2', name: 'Hero B' })
    const quest = questRepository.seed({ characterId: characterA.id, title: 'Academia' })
    const instance = questInstanceRepository.seed({ questId: quest.id, status: 'PENDING' })

    await expect(build().execute({ userId: 'user-2', questInstanceId: instance.id })).rejects.toThrow(NotFoundError)
  })
})
