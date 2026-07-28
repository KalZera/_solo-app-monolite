import type { ID } from '../../../shared/types/index'

export interface QuestCategory {
  id: ID
  name: string
  createdBy: ID
  createdAt: Date
  updatedAt: Date
}

export interface QuestCategoryRepository {
  findAll(): Promise<QuestCategory[]>
}
