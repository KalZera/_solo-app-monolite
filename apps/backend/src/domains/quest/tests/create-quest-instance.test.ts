import { describe, it, expect, beforeEach } from 'vitest'
import { CreateQuestInstanceUseCase } from '../application/create-quest-instance'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryQuestInstanceRepository } from '../infrastructure/in-memory-quest-instance-repository'
import type { Recurrence } from '../domain/recurrence'

describe('CreateQuestInstanceUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let questInstanceRepository: InMemoryQuestInstanceRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    questInstanceRepository = new InMemoryQuestInstanceRepository()
  })

  function build () {
    return new CreateQuestInstanceUseCase(questRepository, questInstanceRepository)
  }

  it.each(['DAILY', 'WEEKLY', 'NONE'] as Recurrence[])(
    'materialises a %s instance while the template deadlineDate has not passed yet',
    async (recurrence) => {
      const quest = questRepository.seed({
        characterId: 'character-1',
        recurrence,
        active: 'ACTIVE',
        deadlineDate: new Date('2026-08-15T23:59:59.999Z'),
      })

      const instances = await build().execute(new Date('2026-08-10T12:00:00.000Z'))

      expect(instances).toHaveLength(1)
      expect(instances[0].questId).toBe(quest.id)
    }
  )

  it.each(['DAILY', 'WEEKLY', 'NONE'] as Recurrence[])(
    'does not materialise a new %s instance once the template deadlineDate has passed',
    async (recurrence) => {
      questRepository.seed({
        characterId: 'character-1',
        recurrence,
        active: 'ACTIVE',
        deadlineDate: new Date('2026-08-02T23:59:59.999Z'),
      })

      const instances = await build().execute(new Date('2026-08-10T12:00:00.000Z'))

      expect(instances).toHaveLength(0)
    }
  )

  it('does not duplicate an instance already materialised for the current period', async () => {
    const quest = questRepository.seed({
      characterId: 'character-1',
      recurrence: 'DAILY',
      active: 'ACTIVE',
      deadlineDate: new Date('2026-08-15T23:59:59.999Z'),
    })
    const now = new Date('2026-08-10T12:00:00.000Z')

    const first = await build().execute(now)
    const second = await build().execute(now)

    expect(first).toHaveLength(1)
    expect(second).toHaveLength(1)
    expect(second[0].id).toBe(first[0].id)
    expect(await questInstanceRepository.findByQuestId(quest.id)).toHaveLength(1)
  })

  // Rule: the template's deadlineDate is one finite value; the instance's own deadline is
  // derived fresh from the recurrence period (DAILY = 24h, WEEKLY = 7 days) and is
  // independent of it — a far-future template deadlineDate must not leak into the instance.
  it.each([
    ['DAILY', 24 * 60 * 60 * 1000],
    ['WEEKLY', 7 * 24 * 60 * 60 * 1000],
  ] as [Recurrence, number][])(
    'gives a %s instance a deadline exactly %i ms after its scheduledDate, regardless of the template deadlineDate',
    async (recurrence, spanMs) => {
      const quest = questRepository.seed({
        characterId: 'character-1',
        recurrence,
        active: 'ACTIVE',
        deadlineDate: new Date('2026-09-01T23:59:59.999Z'), // far beyond the period's own span
      })

      const instances = await build().execute(new Date('2026-08-10T15:00:00.000Z'))

      expect(instances).toHaveLength(1)
      const instance = instances[0]
      const actualSpan = (instance.deadline as Date).getTime() - instance.scheduledDate.getTime() + 1
      expect(actualSpan).toBe(spanMs)
      expect(instance.deadline).not.toEqual(quest.deadlineDate)
    }
  )

  // Rule: a NONE-recurrence quest only ever gets its single lifetime instance — running the
  // materialisation job again must never add a second one for it.
  it('never materialises a second instance for a NONE quest that already has one', async () => {
    const quest = questRepository.seed({
      characterId: 'character-1',
      recurrence: 'NONE',
      active: 'ACTIVE',
      deadlineDate: new Date('2026-08-15T23:59:59.999Z'),
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
    })
    questInstanceRepository.seed({
      questId: quest.id,
      scheduledDate: new Date('2026-08-01T00:00:00.000Z'),
      status: 'PENDING',
      quest,
    })

    const instances = await build().execute(new Date('2026-08-10T12:00:00.000Z'))

    expect(instances).toHaveLength(0)
    expect(await questInstanceRepository.findByQuestId(quest.id)).toHaveLength(1)
  })
})
