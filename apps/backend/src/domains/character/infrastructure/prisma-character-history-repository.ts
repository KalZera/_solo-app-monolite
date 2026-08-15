import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  CharacterHistory,
  CharacterHistoryEntryType,
  CharacterHistoryRepository,
} from '../domain/character-history'
import type { ID, Paginated, PaginationParams } from '../../../shared/types/index'
import { generateId } from '../../../shared/utils/index'

export class PrismaCharacterHistoryRepository implements CharacterHistoryRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async create (
    characterId: ID,
    type: CharacterHistoryEntryType,
    payload: Record<string, unknown>
  ): Promise<CharacterHistory> {
    const record = await this.prisma.characterHistory.create({
      data: { id: generateId(), characterId, type, payload: payload as Prisma.InputJsonValue },
    })
    return { ...record, payload: record.payload as Record<string, unknown> }
  }

  async findByCharacterId (characterId: ID, pagination: PaginationParams): Promise<Paginated<CharacterHistory>> {
    const where = { characterId }

    const [records, total] = await Promise.all([
      this.prisma.characterHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.characterHistory.count({ where }),
    ])

    const data = records.map((record) => ({ ...record, payload: record.payload as Record<string, unknown> }))
    return { data, total, page: pagination.page, pageSize: pagination.pageSize }
  }
}
