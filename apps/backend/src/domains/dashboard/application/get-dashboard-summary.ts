import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository } from '../../quest/domain/quest'
import type { QuestInstanceRepository } from '../../quest/domain/quest-instance'
import { NotFoundError } from '../../../shared/errors/app-error'
import {
  calculateStreak,
  pointsEarnedToday,
  type CompletedQuestRecord,
  type DashboardSummary,
} from '../domain/dashboard-summary'

interface GetDashboardSummaryInput {
  userId: string
}

// Aggregates a lightweight dashboard read-model from the character's quests and their
// executions. Composes existing repositories (no new query methods); ownership is derived
// from the authenticated user, never trusted from the client.
export class GetDashboardSummaryUseCase {
  constructor (
    private readonly characterRepository: CharacterRepository,
    private readonly questRepository: QuestRepository,
    private readonly questInstanceRepository: QuestInstanceRepository
  ) {}

  async execute (input: GetDashboardSummaryInput, now: Date = new Date()): Promise<DashboardSummary> {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const quests = await this.questRepository.findByCharacterId(character.id)

    const completed: CompletedQuestRecord[] = []
    for (const quest of quests) {
      const instances = await this.questInstanceRepository.findByQuestId(quest.id)
      for (const instance of instances) {
        if (instance.status === 'COMPLETED' && instance.completedAt) {
          completed.push({ completedAt: instance.completedAt, rewardXp: quest.rewardXp })
        }
      }
    }

    return {
      completedQuests: completed.length,
      pointsToday: pointsEarnedToday(completed, now),
      streakDays: calculateStreak(completed.map((record) => record.completedAt), now),
    }
  }
}
