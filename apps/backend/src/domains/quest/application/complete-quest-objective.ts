import type { CharacterRepository } from '../../character/domain/character'
import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { QuestRepository, QuestStatus } from '../domain/quest'
import { createQuestObjectiveCompletedEvent } from '../domain/events'
import { ConflictError, NotFoundError } from '../../../shared/errors/app-error'

interface CompleteQuestObjectiveInput {
  userId: string
  questId: string
  objectiveId: string
}

const NON_MODIFIABLE_STATUSES: QuestStatus[] = ['completed', 'failed', 'expired']

export class CompleteQuestObjectiveUseCase {
  constructor(
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event),
  ) {}

  async execute(input: CompleteQuestObjectiveInput) {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const quest = await this.questRepository.findById(input.questId)

    if (!quest || quest.characterId !== character.id) {
      throw new NotFoundError('Quest', input.questId)
    }

    if (NON_MODIFIABLE_STATUSES.includes(quest.status)) {
      throw new ConflictError(`A quest with status "${quest.status}" cannot have its objectives updated`)
    }

    const objective = quest.objectives.find((o) => o.id === input.objectiveId)

    if (!objective) {
      throw new NotFoundError('QuestObjective', input.objectiveId)
    }

    if (objective.completed) {
      throw new ConflictError('This objective has already been completed')
    }

    const updatedQuest = await this.questRepository.updateObjective(quest.id, objective.id, {
      current: objective.target,
      completed: true,
    })

    await this.publishEvent(
      createQuestObjectiveCompletedEvent(quest.id, objective.id, character.id, quest.title, objective.description),
    )

    return { quest: updatedQuest }
  }
}
