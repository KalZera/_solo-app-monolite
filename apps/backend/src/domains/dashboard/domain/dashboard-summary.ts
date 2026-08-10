import type { CharacterStats } from '../../character/domain/character'
import type { CharacterRank } from '../../progression/engines/rank.engine'

// Mirrors frontend-refactor/src/modules/dashboard/domain/dashboard.types.ts — this endpoint
// is the real data source for that screen (dashboardMock/useDashboard.fetchDashboard were the
// placeholder until this existed).
//
// NOTE: `perception` has no dedicated column — the character model's 5th stat is `luck`
// (see CharacterStats). The dashboard screen labels it "Perception"; the profile screen
// labels the same value "Luck". Both read the same underlying stat.
export type AttributeKey = 'strength' | 'agility' | 'intelligence' | 'vitality' | 'perception'

export interface HunterAttribute {
  strength: number
  intelligence: number
  agility: number
  vitality: number
  luck: number
}

export interface DashboardSummary {
  name: string
  rank: CharacterRank
  level: number
  power: number
  xp: number
  xpToNext: number
  xpCurrentLevel: number
  xpRemaining: number
  xpToday: number
  streakDays: number
  attributes: HunterAttribute
  dailyQuests: { completed: number; total: number }
  questsCompletedToday: number
}

export function toHunterAttributes (stats: CharacterStats): HunterAttribute {
  return {
    strength: stats.strength,
    agility: stats.agility,
    intelligence: stats.intelligence,
    vitality: stats.vitality,
    luck: stats.luck,
  }
}

// One completed quest execution: when it was completed and the XP its template rewards.
export interface CompletedQuestRecord {
  completedAt: Date
  rewardXp: number
}

function toDayKey (date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
}

function startOfUTCDay (date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function isSameUTCDay (a: Date, b: Date): boolean {
  return toDayKey(a) === toDayKey(b)
}

// XP earned and quest count from completions on `now`'s (UTC) day.
export function summarizeToday (
  records: CompletedQuestRecord[],
  now: Date
): { xp: number; questsCompleted: number } {
  const today = records.filter((record) => isSameUTCDay(record.completedAt, now))
  return {
    xp: today.reduce((total, record) => total + record.rewardXp, 0),
    questsCompleted: today.length,
  }
}

// Consecutive-day streak of completions, counting back from today. A streak is only
// broken once a full day passes with no completion (today still counts if empty and
// yesterday has one), so the streak isn't lost just because today isn't done yet.
export function calculateStreak (completionDates: Date[], now: Date): number {
  const days = new Set(completionDates.map(toDayKey))
  const cursor = startOfUTCDay(now)

  if (!days.has(toDayKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1)
    if (!days.has(toDayKey(cursor))) return 0
  }

  let streak = 0
  while (days.has(toDayKey(cursor))) {
    streak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}
