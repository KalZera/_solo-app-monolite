import type { ID } from '../../../shared/types/index.js'

export interface Character {
  id: ID
  userId: ID
  name: string
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
  update(id: ID, data: Partial<Character>): Promise<Character>
  delete(id: ID): Promise<void>
}
