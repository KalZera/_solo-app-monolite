import type { ID } from '../../../../shared/types/index'
import type { DayResult, DayResultRepository } from '../../domain/consistency/day-result'
import type { DayResultStatus } from '../../domain/consistency/day-result'
import { DEFAULT_FREEZE_RECOVERY_DAYS, type ProgressionStreakRepository } from '../../domain/consistency/progression-streak'
import { StreakEngine } from '../../engines/consistency/streak.engine'

interface RegisterDayResultInput {
  characterId: ID
  status: DayResultStatus
  date?: Date
}

// The state a character starts from before their streak row exists (mirrors the Prisma defaults).
const INITIAL_STREAK = {
  currentStreak: 0,
  bestStreak: 0,
  freezeBalance: 0,
  daysUntilFreezeRecovery: DEFAULT_FREEZE_RECOVERY_DAYS,
}

// Settles one character's day: advances/breaks the streak per the day's status and writes an
// auditable DayResult row (before/after snapshots). Idempotent — re-running for a day that is
// already settled returns the existing row without touching the streak again.
export class RegisterDayResultUseCase {
  constructor (
    private readonly progressionStreakRepository: ProgressionStreakRepository,
    private readonly dayResultRepository: DayResultRepository,
    private readonly streakEngine: StreakEngine = new StreakEngine()
  ) {}

  async execute (input: RegisterDayResultInput): Promise<DayResult> {
    const date = input.date ?? new Date()

    const existing = await this.dayResultRepository.findByCharacterAndDate(input.characterId, date)
    if (existing) return existing

    const streak = await this.progressionStreakRepository.findByCharacterId(input.characterId)
    const before = streak ?? INITIAL_STREAK

    // Snapshot the "before" balances up front: `upsert` may mutate the streak instance in place,
    // so reading these after it would capture the post-update values.
    const streakBefore = before.currentStreak
    const freezeBefore = before.freezeBalance

    const transition = this.streakEngine.applyDayResult(before, input.status)

    await this.progressionStreakRepository.upsert(input.characterId, {
      currentStreak: transition.currentStreak,
      bestStreak: transition.bestStreak,
      freezeBalance: transition.freezeBalance,
      daysUntilFreezeRecovery: transition.daysUntilFreezeRecovery,
      lastEvaluatedDate: date,
    })

    return this.dayResultRepository.create({
      characterId: input.characterId,
      date,
      status: input.status,
      streakBefore,
      streakAfter: transition.currentStreak,
      freezeBefore,
      freezeAfter: transition.freezeBalance,
      freezeUsed: transition.freezeUsed,
    })
  }
}
