import { randomUUID } from 'crypto'
import type { Character, CharacterRepository } from '../../domain/character.js'
import type { ID } from '../../../../shared/types/index.js'

const DEFAULT_STATS = {
  strength: 1,
  intelligence: 1,
  agility: 1,
  vitality: 1,
  luck: 1,
}

type SeedInput = Pick<Character, 'userId' | 'name'> & Partial<Omit<Character, 'userId' | 'name'>>

export class InMemoryCharacterRepository implements CharacterRepository {
  private characters: Character[] = []

  seed(data: SeedInput): Character {
    const character: Character = {
      id: data.id ?? randomUUID(),
      userId: data.userId,
      name: data.name,
      level: data.level ?? 1,
      experience: data.experience ?? 0,
      powerScore: data.powerScore ?? 5,
      title: data.title ?? 'Novice',
      class: data.class ?? 'warrior',
      stats: data.stats ?? { ...DEFAULT_STATS },
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    }
    this.characters.push(character)
    return character
  }

  async findById(id: ID): Promise<Character | null> {
    return this.characters.find((c) => c.id === id) ?? null
  }

  async findByUserId(userId: ID): Promise<Character[]> {
    return this.characters.filter((c) => c.userId === userId)
  }

  async create(data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
    const character: Character = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.characters.push(character)
    return character
  }

  async update(id: ID, data: Partial<Character>): Promise<Character> {
    const index = this.characters.findIndex((c) => c.id === id)
    if (index === -1) throw new Error(`Character ${id} not found`)
    this.characters[index] = { ...this.characters[index], ...data, updatedAt: new Date() }
    return this.characters[index]
  }

  async delete(id: ID): Promise<void> {
    this.characters = this.characters.filter((c) => c.id !== id)
  }
}
