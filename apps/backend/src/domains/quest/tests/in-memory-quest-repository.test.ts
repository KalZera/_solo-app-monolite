import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'

describe('InMemoryQuestRepository.findByData', () => {
  let repository: InMemoryQuestRepository

  beforeEach(() => {
    repository = new InMemoryQuestRepository()
    repository.seed({ characterId: 'char-1', title: 'Quest A', status: 'available' })
    repository.seed({ characterId: 'char-1', title: 'Quest B', status: 'completed' })
    repository.seed({ characterId: 'char-2', title: 'Quest C', status: 'available' })
  })

  it('filters records matching every provided field', async () => {
    const result = await repository.findByData({ characterId: 'char-1' }, { page: 1, pageSize: 10 })

    expect(result.total).toBe(2)
    expect(result.data.map((q) => q.title).sort()).toEqual(['Quest A', 'Quest B'])
  })

  it('paginates the filtered results', async () => {
    const page1 = await repository.findByData({}, { page: 1, pageSize: 2 })
    const page2 = await repository.findByData({}, { page: 2, pageSize: 2 })

    expect(page1.data).toHaveLength(2)
    expect(page1.total).toBe(3)

    expect(page2.data).toHaveLength(1)
    expect(page2.total).toBe(3)
  })

  it('returns an empty result when no record matches the filter', async () => {
    const result = await repository.findByData({ status: 'expired' }, { page: 1, pageSize: 10 })

    expect(result.data).toHaveLength(0)
    expect(result.total).toBe(0)
  })
})
