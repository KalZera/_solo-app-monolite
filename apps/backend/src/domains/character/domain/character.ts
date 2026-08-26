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

// Single source of truth for the selectable Hunter classes (each is a "focus area"). The API
// schema validates against this list and the frontend mirrors it in character.types.ts + i18n.
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

export interface CharacterStats {
  strength: number
  intelligence: number
  agility: number
  vitality: number
  perception: number
}

export interface CharacterRepository {
  findById(id: ID): Promise<Character | null>
  findByUserId(userId: ID): Promise<Character[]>
  findAll(): Promise<Character[]>
  create(data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character>
  save(id: ID, data: Partial<Character>): Promise<Character>
  delete(id: ID): Promise<void>
}
