import { describe, it, expect, beforeEach } from 'vitest'
import { ListQuestCategoriesUseCase } from '../application/list-quest-categories'
import { InMemoryQuestCategoryRepository } from '../infrastructure/in-memory-quest-category-repository'

describe('ListQuestCategoriesUseCase', () => {
  let repository: InMemoryQuestCategoryRepository

  beforeEach(() => {
    repository = new InMemoryQuestCategoryRepository()
  })

  it('returns all existing quest categories', async () => {
    repository.seed({ name: 'Estudo', createdBy: 'admin-1' })
    repository.seed({ name: 'Saúde', createdBy: 'admin-1' })

    const useCase = new ListQuestCategoriesUseCase(repository)
    const result = await useCase.execute()

    expect(result.map((category) => category.name).sort()).toEqual(['Estudo', 'Saúde'])
  })

  it('returns an empty array when no categories exist', async () => {
    const useCase = new ListQuestCategoriesUseCase(repository)
    const result = await useCase.execute()

    expect(result).toEqual([])
  })
})
