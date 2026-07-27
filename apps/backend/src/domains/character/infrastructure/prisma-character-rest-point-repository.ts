import type { PrismaClient } from '@prisma/client'
import type { CharacterRestPoint, CharacterRestPointRepository } from '../domain/character-rest-point'
import type { ID } from '../../../shared/types/index'
import { generateId } from '../../../shared/utils/index'

export class PrismaCharacterRestPointRepository implements CharacterRestPointRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(characterId: ID): Promise<CharacterRestPoint> {
    return this.prisma.characterRestPoint.create({
      data: { id: generateId(), characterId, restPoints: 0 },
    })
  }
}
