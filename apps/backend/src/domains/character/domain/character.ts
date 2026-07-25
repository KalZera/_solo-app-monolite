import type { ID } from '../../../shared/types/index'

export interface Character {
  id: ID
  userId: ID
  name: string
  avatar: string | null
  level: number
  experience: number
  powerScore: number
  title: string
  class: CharacterClass
  stats: CharacterStats
  createdAt: Date
  updatedAt: Date
}

export type CharacterClass = 'warrior' | 'mage' | 'rogue' | 'ranger' | 'healer'

export type CharacterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'Monarch'

export interface CharacterStats {
  strength: number
  intelligence: number
  agility: number
  vitality: number
  luck: number
}

export interface CharacterRepository {
  findById(id: ID): Promise<Character | null>
  findByUserId(userId: ID): Promise<Character[]>
  create(data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character>
  save(id: ID, data: Partial<Character>): Promise<Character>
  delete(id: ID): Promise<void>
}

export function calculatePowerScore(stats: CharacterStats): number {
  return stats.strength + stats.intelligence + stats.agility + stats.vitality + stats.luck
}

export function calculateRank(powerScore: number): CharacterRank {
  if (powerScore < 500) return 'E'
  if (powerScore < 1500) return 'D'
  if (powerScore < 3500) return 'C'
  if (powerScore < 7000) return 'B'
  if (powerScore < 12000) return 'A'
  if (powerScore < 18000) return 'S'
  if (powerScore < 26000) return 'SS'
  return 'Monarch'
}

// business_rules.md: "every time a user leveled up all attributes receive 1 point" / "5 pontos de status para distribuir livremente"
export const ATTRIBUTE_POINTS_PER_LEVEL = 5

const MAX_QUADRATIC_CURVE_LEVEL = 20

// XP required to go from `level` to `level + 1`.
// Up to level 20: XP = 500 + 100L + 12.5L². After level 20: XP = 500 * (1.15^L).
export function calculateXpToNextLevel(level: number): number {
  if (level <= MAX_QUADRATIC_CURVE_LEVEL) {
    return Math.round(500 + 100 * level + 12.5 * level ** 2)
  }

  return Math.round(500 * Math.pow(1.15, level))
}
