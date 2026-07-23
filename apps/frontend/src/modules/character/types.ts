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
}
