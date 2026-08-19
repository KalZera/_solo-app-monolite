// Mirrors CHARACTER_CLASSES on the backend (domain/character.ts). Each class is a "focus area";
// labels + descriptions live in i18n under character.classes.* / character.classDescriptions.*.
export const CHARACTER_CLASSES = [
  'athlete',
  'strategist',
  'specialist',
  'entrepreneur',
  'leader',
  'researcher',
  'creator',
  'communicator',
  'mentor',
  'executor',
  'generalist',
  'technical_specialist',
  'manager',
  'researcher_creator',
  'leader_strategist',
] as const
export type CharacterClass = (typeof CHARACTER_CLASSES)[number]

export const STAT_KEYS = ['strength', 'intelligence', 'agility', 'vitality', 'perception'] as const
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
  progression: Progression
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

/**
 * Body accepted by `PATCH /characters/`. Only cosmetic fields are editable — name is immutable
 * after creation and attributes change only through the allocation flow (see update-character.ts).
 */
export interface UpdateCharacterInput {
  title?: string
  class?: CharacterClass
  avatar?: string | null
}
