import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { QuestRepository } from '../domain/quest'
import type { QuestInstance, QuestInstanceRepository } from '../domain/quest-instance'
import { shouldAutoFail } from '../domain/quest-instance'
import { createQuestFailedEvent } from '../domain/events'

// Runs on a schedule (see quest-expiration-scheduler-plugin, every 2h). For every instance
// past its deadline (still PENDING or STARTED), see shouldAutoFail for the exact rule:
//   - PENDING (never started) → marked FAILED (no XP) as soon as the deadline passes.
//   - STARTED (in progress)   → gets a grace period (STARTED_FAIL_GRACE_PERIOD_DAYS) past
//     the deadline before also being marked FAILED.
// Instances still within their deadline, or within the STARTED grace period, are never
// touched. Invoked by the scheduler, a worker, or on demand — the "check/fail" logic never
// depends on the trigger.
export class ExpireQuestsUseCase {
  constructor (
    private readonly questInstanceRepository: QuestInstanceRepository,
    private readonly questRepository: QuestRepository,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (now: Date = new Date()): Promise<QuestInstance[]> {
    const dueInstances = await this.questInstanceRepository.findDueForExpiration(now)

    const failed: QuestInstance[] = []
    for (const instance of dueInstances) {
      if (!shouldAutoFail(instance, now)) continue

      const quest = await this.questRepository.findById(instance.questId)
      const updated = await this.questInstanceRepository.save(instance.id, { status: 'FAILED' })
      await this.publishEvent(
        createQuestFailedEvent(updated.id, updated.questId, quest?.characterId ?? '', quest?.title ?? 'Quest')
      )
      failed.push(updated)
    }

    return failed
  }
}
