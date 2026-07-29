import type { PrismaClient } from '@prisma/client'
import type { CharacterHistory, CharacterHistoryRepository } from '../domain/character-history'
import type { ID, Paginated, PaginationParams } from '../../../shared/types/index'
import { generateId } from '../../../shared/utils/index'

export class PrismaCharacterHistoryRepository implements CharacterHistoryRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async create (characterId: ID, description: string): Promise<CharacterHistory> {
    return this.prisma.characterHistory.create({
      data: { id: generateId(), characterId, description },
    })
  }

  async findByCharacterId (characterId: ID, pagination: PaginationParams): Promise<Paginated<CharacterHistory>> {
    const where = { characterId }

    const [data, total] = await Promise.all([
      this.prisma.characterHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.characterHistory.count({ where }),
    ])

    return { data, total, page: pagination.page, pageSize: pagination.pageSize }
  }
}
