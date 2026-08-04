import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { QuestRepository } from '../domain/quest'
import type { QuestInstance, QuestInstanceRepository } from '../domain/quest-instance'
import { createQuestExpiredEvent } from '../domain/events'

// Marks active instances past their deadline as EXPIRED (no XP). Invoked by the scheduler,
// a worker, or on demand — the "ensure/expire" logic never depends on the trigger.
export class ExpireQuestsUseCase {
  constructor (
    private readonly questInstanceRepository: QuestInstanceRepository,
    private readonly questRepository: QuestRepository,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (now: Date = new Date()): Promise<QuestInstance[]> {
    const dueInstances = await this.questInstanceRepository.findDueForExpiration(now)

    const expired: QuestInstance[] = []
    for (const instance of dueInstances) {
      const quest = await this.questRepository.findById(instance.questId)
      const updated = await this.questInstanceRepository.save(instance.id, { status: 'EXPIRED' })
      await this.publishEvent(
        createQuestExpiredEvent(updated.id, updated.questId, quest?.characterId ?? '', quest?.title ?? 'Quest')
      )
      expired.push(updated)
    }

    return expired
  }
}
