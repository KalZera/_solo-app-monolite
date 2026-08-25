import type { ID } from '../../../shared/types/index'

// How a single calendar day's outcome is classified — mirrors the Prisma `DayResultStatus` enum:
//   - COMPLETED       — a normal day that met the daily-quest threshold;
//   - FAILED          — a normal day that did not meet the threshold;
//   - FREE            — a free day (e.g. Sunday) with no daily quest completed;
//   - FREE_COMPLETED  — a free day on which at least one daily quest was completed.
export enum DayResultStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  FREE = 'FREE',
  FREE_COMPLETED = 'FREE_COMPLETED',
}

// Fraction of the day's daily quests that must be completed for a normal day to count as
// COMPLETED (70%). A free day bypasses this — completing any daily quest is enough.
// for MVP if one daily quest is completed is valid for streak 
export const STREAK_DAILY_COMPLETION_THRESHOLD = 0.1

// The settled outcome of one calendar day for a character — mirrors the `day_results` table
// (Prisma DayResult). Unique per (date, characterId). `streakBefore/After` and
// `freezeBefore/After` snapshot the balances around the evaluation so it stays auditable;
// `freezeUsed` records whether a freeze was spent to cover the day.
export interface DayResult {
  id: ID
  characterId: ID
  date: Date
  status: DayResultStatus
  streakBefore: number
  streakAfter: number
  freezeBefore: number
  freezeAfter: number
  freezeUsed: boolean
}

// A row to persist — the id is assigned by the store.
export type CreateDayResultData = Omit<DayResult, 'id'>

export interface DayResultRepository {
  create(data: CreateDayResultData): Promise<DayResult>
  findByCharacterAndDate(characterId: ID, date: Date): Promise<DayResult | null>
}
