import type { ID } from '../../../../shared/types/index'
import type {
  ProgressionStreak,
  ProgressionStreakRepository,
  UpsertProgressionStreakData,
} from '../../domain/consistency/progression-streak'
import { DEFAULT_FREEZE_RECOVERY_DAYS } from '../../domain/consistency/progression-streak'

type SeedInput = Pick<ProgressionStreak, 'characterId'> & Partial<Omit<ProgressionStreak, 'characterId'>>

export class InMemoryProgressionStreakRepository implements ProgressionStreakRepository {
  private streaks: ProgressionStreak[] = []
  private nextId = 1

  // Presets a streak row so a test can start from a known state.
  seed (data: SeedInput): ProgressionStreak {
    const now = new Date()
    const streak: ProgressionStreak = {
      id: data.id ?? this.nextId++,
      characterId: data.characterId,
      currentStreak: data.currentStreak ?? 0,
      bestStreak: data.bestStreak ?? 0,
      freezeBalance: data.freezeBalance ?? 0,
      daysUntilFreezeRecovery: data.daysUntilFreezeRecovery ?? DEFAULT_FREEZE_RECOVERY_DAYS,
      lastEvaluatedDate: data.lastEvaluatedDate ?? null,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    }
    this.streaks.push(streak)
    return streak
  }

  async findByCharacterId (characterId: ID): Promise<ProgressionStreak | null> {
    const streak = this.streaks.find((streak) => streak.characterId === characterId)
    // Return a copy so callers never hold a live reference into the store — mirrors the Prisma
    // repository, which always hydrates a fresh object (a later upsert must not mutate it).
    return streak ? { ...streak } : null
  }

  async upsert (characterId: ID, data: UpsertProgressionStreakData): Promise<ProgressionStreak> {
    const existing = this.streaks.find((streak) => streak.characterId === characterId)

    if (existing) {
      existing.currentStreak = data.currentStreak
      existing.bestStreak = data.bestStreak
      existing.freezeBalance = data.freezeBalance
      existing.daysUntilFreezeRecovery = data.daysUntilFreezeRecovery
      existing.lastEvaluatedDate = data.lastEvaluatedDate
      existing.updatedAt = new Date()
      return existing
    }

    const now = new Date()
    const created: ProgressionStreak = {
      id: this.nextId++,
      characterId,
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    this.streaks.push(created)
    return created
  }
}
