import type { PrismaClient } from '@prisma/client'
import type { QuestCategory, QuestCategoryRepository } from '../domain/quest-category'

export class PrismaQuestCategoryRepository implements QuestCategoryRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async findAll (): Promise<QuestCategory[]> {
    return this.prisma.questCategory.findMany({ orderBy: { name: 'asc' } })
  }
}
