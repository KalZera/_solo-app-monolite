import type { PrismaClient } from '@prisma/client'
import type { CharacterRestPoint, CharacterRestPointRepository } from '../domain/character-rest-point'
import type { ID } from '../../../shared/types/index'
import { generateId } from '../../../shared/utils/index'

export class PrismaCharacterRestPointRepository implements CharacterRestPointRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async create (characterId: ID): Promise<CharacterRestPoint> {
    return this.prisma.characterRestPoint.create({
      data: { id: generateId(), characterId, restPoints: 0 },
    })
  }

  async findByCharacterId (characterId: ID): Promise<CharacterRestPoint | null> {
    return this.prisma.characterRestPoint.findUnique({ where: { characterId } })
  }

  async save (characterId: ID, restPoints: number): Promise<CharacterRestPoint> {
    return this.prisma.characterRestPoint.update({ where: { characterId }, data: { restPoints } })
  }
}
