export const CHARACTER_CLASSES = ['warrior', 'mage', 'rogue', 'ranger', 'healer'] as const
export type CharacterClass = (typeof CHARACTER_CLASSES)[number]

export const STAT_KEYS = ['strength', 'intelligence', 'agility', 'vitality', 'luck'] as const
export type StatKey = (typeof STAT_KEYS)[number]

export type CharacterStats = Record<StatKey, number>

/** Minimal projection of the backend character used by the profile screen. */
export interface CharacterProfile {
  id: string
  name: string
  avatar: string | null
  title?: string
  class?: CharacterClass
  level?: number
  experience?: number
  powerScore?: number
  stats?: CharacterStats
  rank?: string
  progression:Progression
}

interface Progression {
  level: number
  totalXp: number
  currentLevelXp: number
  nextLevelXp: number
  xpIntoCurrentLevel: number
  xpRemaining: number
  progress: number
  attributePointsAvailable: number
}

/** Body accepted by `POST /characters/` (see character.schemas.ts on the backend). */
export interface CreateCharacterInput {
  name: string
  title: string
  class: CharacterClass
  avatar?: string | null
}
