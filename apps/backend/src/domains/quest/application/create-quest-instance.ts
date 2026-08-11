import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { QuestRepository } from '../domain/quest'
import type { QuestFullInstance, QuestInstanceRepository, QuestTab } from '../domain/quest-instance'
import { SCHEDULABLE_RECURRENCES } from '../domain/recurrence'
import { RecurrenceEngine } from '../engines/recurrence.engine'
import { createQuestInstanceCreatedEvent } from '../domain/events'
import { getDateFilter } from '../../../shared/utils/date-filter'

// Materialises (lazily) and returns the current-period instance of every active template of
// the character. Never creates future instances in bulk; the RecurrenceEngine + the
// (questId, scheduledDate) uniqueness make it idempotent. The same "ensure" path is reusable
// by a worker or scheduler.
export class CreateQuestInstanceUseCase {
  constructor (
    private readonly questRepository: QuestRepository,
    private readonly questInstanceRepository: QuestInstanceRepository,
    private readonly recurrenceEngine: RecurrenceEngine = new RecurrenceEngine(),
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (now: Date = new Date()): Promise<QuestFullInstance[]> {
    const quests = await this.questRepository.findManyByActive(true)
    const existedInstances = await this.questInstanceRepository.findByQuestActive(true)
    const instances: QuestFullInstance[] = []

    for (const quest of quests) {
      const InstanceFromQuest = existedInstances.find((instance) => instance.questId === quest.id)
      const {end: questEnd} = getDateFilter(new Date(quest.deadlineDate))
     
      //if instance deadline is less than now this quest is for today or future (Weekly quest)
      if(!!InstanceFromQuest && InstanceFromQuest.deadline.getTime() > new Date().getTime()) continue
      if(!!InstanceFromQuest && InstanceFromQuest.deadline.getTime() < questEnd.getTime()) continue
      
      // CUSTOM recurrence is modelled but not schedulable yet — skip until implemented.
      if (!SCHEDULABLE_RECURRENCES.includes(quest.recurrence) && !!InstanceFromQuest) continue
      
      if(questEnd.getTime() < now.getTime()) continue

      const scheduledDate = this.recurrenceEngine.scheduledDateFor(quest, now)
      let instance = await this.questInstanceRepository.findByQuestAndScheduledDate(quest.id, scheduledDate)
      
      if (!instance) {
        instance = await this.questInstanceRepository.create(this.recurrenceEngine.planFor(quest, now))
        await this.publishEvent(
          createQuestInstanceCreatedEvent(instance.id, quest.id, quest.characterId, quest.title, quest.recurrence)
        )
      }

      instances.push(instance)
    }

    return instances
  }
}
