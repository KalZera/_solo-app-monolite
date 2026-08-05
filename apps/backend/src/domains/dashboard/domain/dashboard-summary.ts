// Read-model shapes + pure aggregation logic for the dashboard summary. No I/O:
// the use case supplies already-loaded data so this stays trivially testable.
export interface DashboardSummary {
  completedQuests: number
  streakDays: number
  pointsToday: number
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

// XP earned from quests completed on `now`'s (UTC) day.
export function pointsEarnedToday (records: CompletedQuestRecord[], now: Date): number {
  const todayKey = toDayKey(now)
  return records
    .filter((record) => toDayKey(record.completedAt) === todayKey)
    .reduce((total, record) => total + record.rewardXp, 0)
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
