import { DayResultStatus } from '../../domain/consistency/day-result'
import { DEFAULT_FREEZE_RECOVERY_DAYS, type ProgressionStreak } from '../../domain/consistency/progression-streak'

// The prior streak state an evaluation reads from (the persisted fields it cares about).
export type StreakState = Pick<
  ProgressionStreak,
  'currentStreak' | 'bestStreak' | 'freezeBalance' | 'daysUntilFreezeRecovery'
>

// The new streak state produced by evaluating one day, plus the freeze bookkeeping the
// DayResult row records (`freezeUsed` = a freeze was spent to cover a FAILED day).
export interface StreakTransition {
  currentStreak: number
  bestStreak: number
  freezeBalance: number
  daysUntilFreezeRecovery: number
  freezeUsed: boolean
}

// Pure streak logic — the single source of truth for "given the prior streak state and one
// day's classified status, what is the next state?". It has no knowledge of persistence, HTTP
// or quests, so it is deterministic and trivially testable (mirrors ProgressionEngine).
//
// `freezeRecoveryDays` is injectable so seasons/difficulty tiers can tune how often a freeze
// is earned back without editing this class (Open/Closed).
export class StreakEngine {
  constructor (
    private readonly freezeRecoveryDays: number = DEFAULT_FREEZE_RECOVERY_DAYS
  ) {}

  // Advance/break the streak for a single day:
  //   - COMPLETED / FREE_COMPLETED → the day counts: the streak advances by one.
  //     FREE_COMPLETED additionally earns a freeze back (doing the work on a free day).
  //   - FREE → a free day carries the streak forward unchanged (no advance, no break).
  //   - FAILED → the streak is at risk: a banked freeze (if any) is spent to protect it,
  //     otherwise the streak resets to zero.
  // Independently, every evaluated day ticks the freeze-recovery countdown; when it reaches
  // zero a freeze is granted back and the countdown resets.
  applyDayResult (state: StreakState, status: DayResultStatus): StreakTransition {
    let currentStreak = state.currentStreak
    let freezeBalance = state.freezeBalance
    let daysUntilFreezeRecovery = state.daysUntilFreezeRecovery
    let freezeUsed = false

    switch (status) {
      case DayResultStatus.COMPLETED:
        currentStreak += 1
        break
      case DayResultStatus.FREE_COMPLETED:
        currentStreak += 1
        break
      case DayResultStatus.FREE:
        // A free day preserves the streak without advancing it.
        break
      case DayResultStatus.FAILED:
        if (currentStreak > 0 && freezeBalance > 0) {
          freezeBalance -= 1
          freezeUsed = true
        } else {
          // Not freeze-able: the streak breaks and resets to zero.
          currentStreak = 0
        }
        daysUntilFreezeRecovery = this.freezeRecoveryDays
        break
    }

    if (!freezeUsed && status !== DayResultStatus.FAILED) {
      daysUntilFreezeRecovery -= 1
      if (daysUntilFreezeRecovery <= 0 && freezeBalance < 2) {
        freezeBalance += 1
        daysUntilFreezeRecovery = this.freezeRecoveryDays
      }
    }

    const bestStreak = Math.max(state.bestStreak, currentStreak)

    return { currentStreak, bestStreak, freezeBalance, daysUntilFreezeRecovery, freezeUsed }
  }
}
