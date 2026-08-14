import { describe, it, expect, beforeEach } from 'vitest'
import { DeactivateExpiredQuestsUseCase } from '../application/deactivate-expired-quests'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'

describe('DeactivateExpiredQuestsUseCase', () => {
  let questRepository: InMemoryQuestRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
  })

  function build () {
    return new DeactivateExpiredQuestsUseCase(questRepository)
  }

  it('marks an active quest whose deadlineDate has already passed as COMPLETED', async () => {
    const quest = questRepository.seed({
      characterId: 'character-1',
      active: 'ACTIVE',
      deadlineDate: new Date('2026-08-02T23:59:59.999Z'),
    })

    const deactivated = await build().execute(new Date('2026-08-10T12:00:00.000Z'))

    expect(deactivated).toHaveLength(1)
    expect(deactivated[0].id).toBe(quest.id)
    expect(await questRepository.findById(quest.id)).toMatchObject({ active: 'COMPLETED' })
  })

  it('does nothing to an active quest whose deadlineDate is still in the future', async () => {
    const quest = questRepository.seed({
      characterId: 'character-1',
      active: 'ACTIVE',
      deadlineDate: new Date('2026-08-15T23:59:59.999Z'),
    })

    const deactivated = await build().execute(new Date('2026-08-10T12:00:00.000Z'))

    expect(deactivated).toHaveLength(0)
    expect(await questRepository.findById(quest.id)).toMatchObject({ active: 'ACTIVE' })
  })

  it('ignores quests that are not ACTIVE (already cancelled/completed)', async () => {
    questRepository.seed({
      characterId: 'character-1',
      active: 'CANCELLED',
      deadlineDate: new Date('2026-08-02T23:59:59.999Z'),
    })

    const deactivated = await build().execute(new Date('2026-08-10T12:00:00.000Z'))

    expect(deactivated).toHaveLength(0)
  })
})
