import type { DashboardSummary } from '../domain/dashboard.types'

// Placeholder data. Swap this for a real `GET /dashboard` request once the
// backend endpoint exists — the query hook is the only thing that changes.
export const dashboardMock: DashboardSummary = {
  name: 'Sung Jinwoo',
  rank: 'S',
  level: 42,
  power: 9840,
  xp: 3200,
  xpToNext: 5000,
  xpToday: 180,
  streakDays: 12,
  attributes: [
    { key: 'strength', value: 128 },
    { key: 'agility', value: 96 },
    { key: 'intelligence', value: 74 },
    { key: 'vitality', value: 110 },
    { key: 'perception', value: 88 },
  ],
  dailyQuests: { completed: 3, total: 5 },
  dailyRecurringQuests: { completed: 3, total: 5 },
  weeklyRecurringQuests: { completed: 1, total: 2 },
  questsCompletedToday: 3,
}
