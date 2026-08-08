import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository } from '../domain/quest'
import type { QuestInstanceRepository } from '../domain/quest-instance'
import { isTerminalStatus } from '../domain/quest-instance'
import { createQuestFailedEvent } from '../domain/events'
import { ConflictError, NotFoundError } from '../../../shared/errors/app-error'

interface FailQuestInput {
  userId: string
  questInstanceId: string
}

// Marks an instance FAILED. No XP is granted (only CompleteQuest grants XP).
export class FailQuestUseCase {
  constructor (
    private readonly questInstanceRepository: QuestInstanceRepository,
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (input: FailQuestInput) {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null
    if (!character) throw new NotFoundError('Character', input.userId)

    const instance = await this.questInstanceRepository.findById(input.questInstanceId)
    if (!instance) throw new NotFoundError('QuestInstance', input.questInstanceId)

    const quest = instance.quest ?? await this.questRepository.findById(instance.questId)
    if (!quest || quest.characterId !== character.id) {
      throw new NotFoundError('QuestInstance', input.questInstanceId)
    }

    if (isTerminalStatus(instance.status)) {
      throw new ConflictError(`A quest instance with status "${instance.status}" cannot be failed`)
    }

    const updated = await this.questInstanceRepository.save(instance.id, { status: 'FAILED' })

    await this.publishEvent(createQuestFailedEvent(updated.id, quest.id, character.id, quest.title))

    return { instance: updated }
  }
}
