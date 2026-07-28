export type CharacterClass = 'warrior' | 'mage' | 'rogue' | 'ranger' | 'healer'

export type CharacterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'Monarch'

export interface CharacterStats {
  strength: number
  intelligence: number
  agility: number
  vitality: number
  luck: number
}

export interface Character {
  id: string
  userId: string
  name: string
  avatar: string | null
  level: number
  experience: number
  powerScore: number
  title: string
  class: CharacterClass
  stats: CharacterStats
  createdAt: string
  updatedAt: string
}

export interface CharacterProfile extends Character {
  rank: CharacterRank
  restPoints: number
}

export type AllocatableAttribute = keyof CharacterStats

export interface AllocateAttributePointInput {
  attribute: AllocatableAttribute
  amount: number
}

export interface AllocateAttributePointResult {
  character: Character
  restPoints: number
}

export interface CreateCharacterInput {
  name: string
  class: CharacterClass
  title: string
}

export interface CharacterHistoryEntry {
  id: string
  characterId: string
  description: string
  createdAt: string
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
