import { randomUUID } from 'crypto'
import type { QuestCategory, QuestCategoryRepository } from '../domain/quest-category'

type SeedInput = Pick<QuestCategory, 'name' | 'createdBy'> & Partial<Omit<QuestCategory, 'name' | 'createdBy'>>

export class InMemoryQuestCategoryRepository implements QuestCategoryRepository {
  private categories: QuestCategory[] = []

  seed(data: SeedInput): QuestCategory {
    const category: QuestCategory = {
      id: data.id ?? randomUUID(),
      name: data.name,
      createdBy: data.createdBy,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    }
    this.categories.push(category)
    return category
  }

  async findAll(): Promise<QuestCategory[]> {
    return [...this.categories]
  }
}
