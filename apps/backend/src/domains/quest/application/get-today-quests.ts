import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository } from '../domain/quest'
import type { QuestInstance, QuestInstanceRepository } from '../domain/quest-instance'
import { SCHEDULABLE_RECURRENCES } from '../domain/recurrence'
import { RecurrenceEngine } from '../engines/recurrence.engine'
import { createQuestInstanceCreatedEvent } from '../domain/events'
import { NotFoundError } from '../../../shared/errors/app-error'

interface GetTodayQuestsInput {
  userId: string
}

// Materialises (lazily) and returns the current-period instance of every active template of
// the character. Never creates future instances in bulk; the RecurrenceEngine + the
// (questId, scheduledDate) uniqueness make it idempotent. The same "ensure" path is reusable
// by a worker or scheduler.
export class GetTodayQuestsUseCase {
  constructor (
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly questInstanceRepository: QuestInstanceRepository,
    private readonly recurrenceEngine: RecurrenceEngine = new RecurrenceEngine(),
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (input: GetTodayQuestsInput, now: Date = new Date()): Promise<QuestInstance[]> {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const quests = await this.questRepository.findActiveByCharacterId(character.id)
    const instances: QuestInstance[] = []

    for (const quest of quests) {
      // CUSTOM recurrence is modelled but not schedulable yet — skip until implemented.
      if (!SCHEDULABLE_RECURRENCES.includes(quest.recurrence)) continue

      const scheduledDate = this.recurrenceEngine.scheduledDateFor(quest, now)
      let instance = await this.questInstanceRepository.findByQuestAndScheduledDate(quest.id, scheduledDate)

      if (!instance) {
        instance = await this.questInstanceRepository.create(this.recurrenceEngine.planFor(quest, now))
        await this.publishEvent(
          createQuestInstanceCreatedEvent(instance.id, quest.id, character.id, quest.title, quest.recurrence)
        )
      }

      instances.push(instance)
    }

    return instances
  }
}
