import type { QuestCategoryRepository } from '../domain/quest-category'

export class ListQuestCategoriesUseCase {
  constructor(private readonly repository: QuestCategoryRepository) {}

  async execute() {
    return this.repository.findAll()
  }
}
