import type { DashboardSummary } from '../domain/dashboard.types'

// Placeholder data (currently unused — the dashboard reads the real `GET /dashboard/summary`).
// Kept as a typed reference for the DashboardSummary shape.
export const dashboardMock: DashboardSummary = {
  name: 'Sung Jinwoo',
  rank: 'S',
  level: 42,
  power: 9840,
  xp: 3200,
  xpToNext: 5000,
  xpCurrentLevel: 3200,
  xpRemaining: 1800,
  xpToday: 180,
  streakDays: 12,
  attributes: {
    strength: 128,
    agility: 96,
    intelligence: 74,
    vitality: 110,
    perception: 88,
  },
  dailyQuests: { completed: 3, total: 5 },
  dailyRecurringQuests: { completed: 3, total: 5 },
  weeklyRecurringQuests: { completed: 1, total: 2 },
  questsCompletedToday: 3,
}
