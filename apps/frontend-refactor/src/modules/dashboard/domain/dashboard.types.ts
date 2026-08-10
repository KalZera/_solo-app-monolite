export type AttributeKey = 'strength' | 'agility' | 'intelligence' | 'vitality' | 'luck'

export interface HunterAttribute {
  strength: number
  intelligence: number
  agility: number
  vitality: number
  luck: number
}

export interface DashboardSummary {
  name: string
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
  questsCompletedToday: number
}
