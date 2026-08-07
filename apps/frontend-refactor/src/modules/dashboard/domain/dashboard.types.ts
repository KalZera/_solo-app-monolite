export type AttributeKey = 'strength' | 'agility' | 'intelligence' | 'vitality' | 'perception'

export interface HunterAttribute {
  key: AttributeKey
  value: number
}

export interface DashboardSummary {
  name: string
  rank: string
  level: number
  power: number
  xp: number
  xpToNext: number
  streakDays: number
  attributes: HunterAttribute[]
  dailyQuests: { completed: number; total: number }
}
