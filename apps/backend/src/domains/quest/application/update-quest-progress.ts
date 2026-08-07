import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository } from '../domain/quest'
import type { QuestInstanceRepository } from '../domain/quest-instance'
import { calculateProgress, isTerminalStatus, QuestInstanceObjective } from '../domain/quest-instance'
import { createQuestProgressUpdatedEvent } from '../domain/events'
import { ConflictError, NotFoundError } from '../../../shared/errors/app-error'

interface UpdateQuestProgressInput {
  userId: string
  questInstanceId: string
  objectiveId: string
  // When omitted, the objective is marked fully done (current = target).
  current?: number
}

// Replaces the old CompleteQuestObjective use case: updates one objective and recomputes the
// instance's derived progress. Completion of the instance itself stays explicit (CompleteQuest).
export class UpdateQuestProgressUseCase {
  constructor (
    private readonly questInstanceRepository: QuestInstanceRepository,
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (input: UpdateQuestProgressInput) {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null
    if (!character) throw new NotFoundError('Character', input.userId)

    const instance = await this.questInstanceRepository.findById(input.questInstanceId)
    if (!instance) throw new NotFoundError('QuestInstance', input.questInstanceId)

    const quest = await this.questRepository.findById(instance.questId)
    if (!quest || quest.characterId !== character.id) {
      throw new NotFoundError('QuestInstance', input.questInstanceId)
    }

    if (isTerminalStatus(instance.status)) {
      throw new ConflictError(`A quest instance with status "${instance.status}" cannot have its progress updated`)
    }

    const objective = (instance.objectives as QuestInstanceObjective[]).find((candidate) => candidate.id === input.objectiveId)
    if (!objective) {
      throw new NotFoundError('QuestInstanceObjective', input.objectiveId)
    }

    const target = objective.target
    const current = Math.min(Math.max(input.current ?? target, 0), target)
    const withObjective = await this.questInstanceRepository.updateObjective(instance.id, objective.id, {
      current,
      completed: current >= target,
    })

    const progress = calculateProgress(withObjective.objectives as QuestInstanceObjective[])
    const updated = await this.questInstanceRepository.save(instance.id, { progress })

    await this.publishEvent(createQuestProgressUpdatedEvent(updated.id, quest.id, character.id, progress))

    return { instance: updated }
  }
}
