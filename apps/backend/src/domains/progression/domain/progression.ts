import type { ID } from '../../../shared/types/index.js'

export interface ProgressionRecord {
  id: ID
  characterId: ID
  level: number
  experience: number
  totalExperience: number
  updatedAt: Date
}

export function xpForLevel (level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

export function calculateLevel (totalXp: number): number {
  let level = 1
  let xpRequired = 0
  while (xpRequired + xpForLevel(level) <= totalXp) {
    xpRequired += xpForLevel(level)
    level++
  }
  return level
}
