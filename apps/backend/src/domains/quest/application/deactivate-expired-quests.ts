import type { Quest, QuestRepository } from '../domain/quest'

// Runs on a schedule (see quest-deactivation-scheduler-plugin, every 6h). A Quest template
// with a deadlineDate in the past no longer has a reason to keep materialising instances, so
// it's flipped to active = false. Templates with a future deadlineDate are left untouched;
// this job only ever turns quests off, never back on.
export class DeactivateExpiredQuestsUseCase {
  constructor (
    private readonly questRepository: QuestRepository
  ) {}

  async execute (now: Date = new Date()): Promise<Quest[]> {
    const activeQuests = await this.questRepository.findManyByActive(true)
    const expired = activeQuests.filter((quest) => quest.deadlineDate.getTime() < now.getTime())

    return Promise.all(
      expired.map((quest) => this.questRepository.save(quest.id, { active: false }))
    )
  }
}
