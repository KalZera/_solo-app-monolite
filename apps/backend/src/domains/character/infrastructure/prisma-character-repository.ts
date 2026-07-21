import type { PrismaClient, Character as PrismaCharacter } from '@prisma/client'
import type { Character, CharacterClass, CharacterRepository } from '../domain/character.js'
import type { ID } from '../../../shared/types/index.js'
import { generateId } from '../../../shared/utils/index.js'

function toDomain(record: PrismaCharacter): Character {
  return {
    id: record.id,
    userId: record.userId,
    name: record.name,
    level: record.level,
    experience: record.experience,
    powerScore: record.powerScore,
    title: record.title,
    class: record.class as CharacterClass,
    stats: {
      strength: record.strength,
      intelligence: record.intelligence,
      agility: record.agility,
      vitality: record.vitality,
      luck: record.luck,
    },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export class PrismaCharacterRepository implements CharacterRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: ID): Promise<Character | null> {
    const record = await this.prisma.character.findUnique({ where: { id } })
    return record ? toDomain(record) : null
  }

  async findByUserId(userId: ID): Promise<Character[]> {
    const records = await this.prisma.character.findMany({ where: { userId } })
    return records.map(toDomain)
  }

  async create(data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
    const record = await this.prisma.character.create({
      data: {
        id: generateId(),
        userId: data.userId,
        name: data.name,
        level: data.level,
        experience: data.experience,
        powerScore: data.powerScore,
        title: data.title,
        class: data.class,
        strength: data.stats.strength,
        intelligence: data.stats.intelligence,
        agility: data.stats.agility,
        vitality: data.stats.vitality,
        luck: data.stats.luck,
      },
    })
    return toDomain(record)
  }

  async update(id: ID, data: Partial<Character>): Promise<Character> {
    const { stats, ...rest } = data
    const record = await this.prisma.character.update({
      where: { id },
      data: {
        ...rest,
        ...(stats && {
          strength: stats.strength,
          intelligence: stats.intelligence,
          agility: stats.agility,
          vitality: stats.vitality,
          luck: stats.luck,
        }),
      },
    })
    return toDomain(record)
  }

  async delete(id: ID): Promise<void> {
    await this.prisma.character.delete({ where: { id } })
  }
}
