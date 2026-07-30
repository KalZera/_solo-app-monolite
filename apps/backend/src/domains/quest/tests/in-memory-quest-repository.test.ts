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

describe('InMemoryQuestRepository.findExpiredActiveQuests', () => {
  let repository: InMemoryQuestRepository
  const now = new Date('2026-07-30T12:00:00.000Z')
  const past = new Date('2026-07-29T00:00:00.000Z')
  const future = new Date('2026-08-01T00:00:00.000Z')

  beforeEach(() => {
    repository = new InMemoryQuestRepository()
  })

  it('returns available/in_progress quests whose deadline has passed', async () => {
    repository.seed({ characterId: 'char-1', title: 'Past due, available', status: 'available', expiresAt: past })
    repository.seed({ characterId: 'char-1', title: 'Past due, in progress', status: 'in_progress', expiresAt: past })

    const result = await repository.findExpiredActiveQuests(now)

    expect(result.map((q) => q.title).sort()).toEqual(['Past due, available', 'Past due, in progress'])
  })

  it('excludes quests with no deadline, a future deadline, or an already-terminal status', async () => {
    repository.seed({ characterId: 'char-1', title: 'No deadline', status: 'available', expiresAt: null })
    repository.seed({ characterId: 'char-1', title: 'Not due yet', status: 'available', expiresAt: future })
    repository.seed({ characterId: 'char-1', title: 'Already completed', status: 'completed', expiresAt: past })
    repository.seed({ characterId: 'char-1', title: 'Already failed', status: 'failed', expiresAt: past })
    repository.seed({ characterId: 'char-1', title: 'Already expired', status: 'expired', expiresAt: past })

    const result = await repository.findExpiredActiveQuests(now)

    expect(result).toHaveLength(0)
  })
})
