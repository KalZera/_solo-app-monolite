import type { Quest, QuestRepository } from '../domain/quest'
import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import { createQuestExpiredEvent } from '../domain/events'

export class ExpireQuestsUseCase {
  constructor (
    private readonly questRepository: QuestRepository,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (now: Date = new Date()): Promise<Quest[]> {
    const expiredQuests = await this.questRepository.findExpiredActiveQuests(now)

    const failedQuests: Quest[] = []
    for (const quest of expiredQuests) {
      const failedQuest = await this.questRepository.save(quest.id, { status: 'failed' })
      await this.publishEvent(
        createQuestExpiredEvent(failedQuest.id, failedQuest.characterId, failedQuest.type, failedQuest.title)
      )
      failedQuests.push(failedQuest)
    }

    return failedQuests
  }
}
