import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository } from '../domain/quest'
import type { QuestInstanceRepository } from '../domain/quest-instance'
import { isTerminalStatus } from '../domain/quest-instance'
import { createQuestStartedEvent } from '../domain/events'
import { ConflictError, NotFoundError } from '../../../shared/errors/app-error'

interface StartQuestInput {
  userId: string
  questInstanceId: string
}

export class StartQuestUseCase {
  constructor (
    private readonly questInstanceRepository: QuestInstanceRepository,
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (input: StartQuestInput) {
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
      throw new ConflictError(`A quest instance with status "${instance.status}" cannot be started`)
    }
    if (instance.status === 'STARTED') {
      throw new ConflictError('This quest instance has already been started')
    }

    const updated = await this.questInstanceRepository.save(instance.id, { status: 'STARTED', startedAt: new Date() })

    await this.publishEvent(createQuestStartedEvent(updated.id, quest.id, character.id, quest.title))

    return { instance: updated }
  }
}
