import type { ID } from '../../../../shared/types/index'

// Per-character running streak state — mirrors the `progression_streaks` table
// (Prisma ProgressionStreak). One row per Character. It is the source of truth the daily
// evaluation reads and updates:
//   - freezeBalance            — streak-freezes currently banked (spent to cover a failed day);
//   - daysUntilFreezeRecovery  — countdown of evaluated days until the next freeze is earned back;
//   - lastEvaluatedDate        — the last calendar day the evaluation has already settled.
export interface ProgressionStreak {
  id: number
  characterId: ID
  currentStreak: number
  bestStreak: number
  freezeBalance: number
  daysUntilFreezeRecovery: number
  lastEvaluatedDate: Date | null
  createdAt: Date
  updatedAt: Date
}

// The fields a fresh streak row starts with (mirrors the Prisma column defaults).
export const DEFAULT_FREEZE_RECOVERY_DAYS = 7

// Data needed to upsert a character's streak row (create on first evaluation, update after).
export interface UpsertProgressionStreakData {
  currentStreak: number
  bestStreak: number
  freezeBalance: number
  daysUntilFreezeRecovery: number
  lastEvaluatedDate: Date
}

export interface ProgressionStreakRepository {
  findByCharacterId(characterId: ID): Promise<ProgressionStreak | null>
  upsert(characterId: ID, data: UpsertProgressionStreakData): Promise<ProgressionStreak>
}
