import type { CharacterStats } from '../../character/domain/character'
import type { CharacterRank } from '../../progression/engines/rank.engine'

// Mirrors frontend-refactor/src/modules/dashboard/domain/dashboard.types.ts — this endpoint
// is the real data source for that screen (dashboardMock/useDashboard.fetchDashboard were the
// placeholder until this existed).
//
// The 5th attribute is `perception` (Perception/Sense — social & behavioural awareness); it maps
// 1:1 to the CharacterStats.perception column and is labelled the same on the dashboard and the
// profile screen.
export type AttributeKey = 'strength' | 'agility' | 'intelligence' | 'vitality' | 'perception'

export interface HunterAttribute {
  strength: number
  intelligence: number
  agility: number
  vitality: number
  perception: number
}

export interface DashboardSummary {
  name: string
  avatar:string | null
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
  // Daily quests that HAVE an instance scheduled for today (materialised by the scheduler),
  // and how many of those are done — "today's daily board".
  dailyQuests: { completed: number; total: number }
  // How many DAILY-recurrence quests currently EXIST (active templates that keep recurring,
  // capped at MAX_ACTIVE_DAILY_QUESTS) and how many of them are already completed today.
  // Unlike `dailyQuests`, `total` counts the templates themselves, so it doesn't depend on
  // the scheduler having materialised today's instance yet.
  dailyRecurringQuests: { completed: number; total: number }
  // Same rule as `dailyRecurringQuests`, for WEEKLY-recurrence quests: how many active weekly
  // templates exist and how many are completed for the CURRENT week — the instance whose
  // 7-day period contains `now` (see isWithinWeeklyPeriod).
  weeklyRecurringQuests: { completed: number; total: number }
  questsCompletedToday: number
}

export function toHunterAttributes (stats: CharacterStats): HunterAttribute {
  return {
    strength: stats.strength,
    agility: stats.agility,
    intelligence: stats.intelligence,
    vitality: stats.vitality,
    perception: stats.perception,
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

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

// True when `now` falls inside the 7-day period that starts at a WEEKLY instance's
// scheduledDate. WEEKLY periods are anchored to the quest's own start day — there is no
// calendar-week (Monday) anchor (see quest WeeklyStrategy) — so the current period is simply
// [scheduledDate, scheduledDate + 7 days). Consecutive instances are exactly 7 days apart,
// so at most one instance's period contains any given instant.
export function isWithinWeeklyPeriod (scheduledDate: Date, now: Date): boolean {
  const start = scheduledDate.getTime()
  return now.getTime() >= start && now.getTime() < start + WEEK_MS
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
