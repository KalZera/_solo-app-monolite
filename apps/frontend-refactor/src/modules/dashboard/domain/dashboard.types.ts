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
  avatar: string | null
  rank: string
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
  dailyRecurringQuests: { completed: number; total: number }
  weeklyRecurringQuests: { completed: number; total: number }
  questsCompletedToday: number
}
