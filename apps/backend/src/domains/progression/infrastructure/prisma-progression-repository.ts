import type { PrismaClient } from '@prisma/client'
import type { ProgressionRepository } from '../repositories/progression-repository'
import type { CharacterProgression } from '../entities/character-progression'
import type { ID } from '../../../shared/types/index'

const PROGRESSION_SELECT = {
  id: true,
  level: true,
  experience: true,
  powerScore: true,
  strength: true,
  intelligence: true,
  agility: true,
  vitality: true,
  luck: true,
} as const

type ProgressionRecord = {
  id: string
  level: number
  experience: number
  powerScore: number
  strength: number
  intelligence: number
  agility: number
  vitality: number
  luck: number
}

function toDomain(record: ProgressionRecord): CharacterProgression {
  return {
    characterId: record.id,
    level: record.level,
    experience: record.experience,
    powerScore: record.powerScore,
    stats: {
      strength: record.strength,
      intelligence: record.intelligence,
      agility: record.agility,
      vitality: record.vitality,
      luck: record.luck,
    },
  }
}

export class PrismaProgressionRepository implements ProgressionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCharacterId(characterId: ID): Promise<CharacterProgression | null> {
    const record = await this.prisma.character.findUnique({
      where: { id: characterId },
      select: PROGRESSION_SELECT,
    })

    if (!record) return null

    return toDomain(record)
  }

  async save(
    characterId: ID,
    data: Partial<Pick<CharacterProgression, 'level' | 'experience' | 'stats' | 'powerScore'>>,
  ): Promise<CharacterProgression> {
    const { stats, ...rest } = data

    const record = await this.prisma.character.update({
      where: { id: characterId },
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
      select: PROGRESSION_SELECT,
    })

    return toDomain(record)
  }

  async addRestPoints(characterId: ID, amount: number): Promise<void> {
    await this.prisma.characterRestPoint.update({
      where: { characterId },
      data: { restPoints: { increment: amount } },
    })
  }
}
