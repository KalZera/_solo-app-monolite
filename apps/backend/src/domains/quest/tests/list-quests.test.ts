import { describe, it, expect, beforeEach } from 'vitest'
import { ListQuestsUseCase } from '../application/list-quests'
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { InMemoryQuestInstanceRepository } from '../infrastructure/in-memory-quest-instance-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import type { Quest } from '../domain/quest'

const USER_ID = 'user-1'
const TOTAL = 25

describe('ListQuestsUseCase (pagination)', () => {
  let instances: InMemoryQuestInstanceRepository
  let characters: InMemoryCharacterRepository

  beforeEach(() => {
    instances = new InMemoryQuestInstanceRepository()
    characters = new InMemoryCharacterRepository()
    const character = characters.seed({ userId: USER_ID, name: 'Jinwoo' })
    for (let i = 0; i < TOTAL; i++) {
      instances.seed({
        questId: `q${i}`,
        quest: { id: `q${i}`, characterId: character.id, title: `Quest ${i}` } as Quest,
      })
    }
  })

  function build () {
    return new ListQuestsUseCase(instances, characters)
  }

  it('returns the first page with pagination metadata', async () => {
    const result = await build().execute({ userId: USER_ID, page: 1, pageSize: 10 })
    expect(result.data).toHaveLength(10)
    expect(result.total).toBe(TOTAL)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
  })

  it('returns only the remaining items on the last page', async () => {
    const result = await build().execute({ userId: USER_ID, page: 3, pageSize: 10 })
    expect(result.data).toHaveLength(5)
    expect(result.total).toBe(TOTAL)
  })

  it('defaults to page 1 with the default page size', async () => {
    const result = await build().execute({ userId: USER_ID })
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
    expect(result.data).toHaveLength(10)
  })

  it('flattens each instance with its template fields plus an `instance` sub-object', async () => {
    const result = await build().execute({ userId: USER_ID, pageSize: 1 })
    const quest = result.data[0]
    expect(quest.instance).toBeDefined()
    expect(quest.instance.questId).toBe(quest.id)
  })

  it('rejects a non-positive page', async () => {
    await expect(build().execute({ userId: USER_ID, page: 0 })).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects a pageSize over the maximum', async () => {
    await expect(build().execute({ userId: USER_ID, pageSize: 51 })).rejects.toBeInstanceOf(
      ValidationError
    )
  })

  it('throws NotFoundError when the user has no character', async () => {
    await expect(build().execute({ userId: 'ghost' })).rejects.toBeInstanceOf(NotFoundError)
  })
})
