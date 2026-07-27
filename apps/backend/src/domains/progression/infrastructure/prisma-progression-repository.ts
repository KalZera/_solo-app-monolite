import type { PrismaClient } from '@prisma/client'
import type { ProgressionRepository } from '../repositories/progression-repository'
import type { CharacterProgression } from '../entities/character-progression'
import type { ID } from '../../../shared/types/index'

export class PrismaProgressionRepository implements ProgressionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCharacterId(characterId: ID): Promise<CharacterProgression | null> {
    const record = await this.prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true, level: true, experience: true },
    })

    if (!record) return null

    return { characterId: record.id, level: record.level, experience: record.experience }
  }

  async save(
    characterId: ID,
    data: Partial<Pick<CharacterProgression, 'level' | 'experience'>>,
  ): Promise<CharacterProgression> {
    const record = await this.prisma.character.update({
      where: { id: characterId },
      data,
      select: { id: true, level: true, experience: true },
    })

    return { characterId: record.id, level: record.level, experience: record.experience }
  }
}
