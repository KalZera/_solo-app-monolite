import type { Quest, QuestRepository } from '../domain/quest'

// Runs on a schedule (see quest-deactivation-scheduler-plugin, every 6h). A Quest template whose
// deadlineDate is in the past has reached its deadline, so it's marked COMPLETED and stops
// materialising instances. Templates with a future deadlineDate are left untouched; this job only
// ever completes ACTIVE quests (never CANCELLED ones, and never turns a quest back on).
export class DeactivateExpiredQuestsUseCase {
  constructor (
    private readonly questRepository: QuestRepository
  ) {}

  async execute (now: Date = new Date()): Promise<Quest[]> {
    const activeQuests = await this.questRepository.findManyByActive('ACTIVE')
    const expired = activeQuests.filter((quest) => quest.deadlineDate.getTime() < now.getTime())

    return Promise.all(
      expired.map((quest) => this.questRepository.save(quest.id, { active: 'COMPLETED' }))
    )
  }
}
