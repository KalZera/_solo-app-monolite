import { describe, it, expect, beforeEach } from 'vitest'
import { ListQuestsUseCase } from '../application/list-quests'
import { NotFoundError } from '../../../shared/errors/app-error'
import { InMemoryQuestRepository } from '../infrastructure/in-memory-quest-repository'
import { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'

describe('ListQuestsUseCase', () => {
  let questRepository: InMemoryQuestRepository
  let characterRepository: InMemoryCharacterRepository

  beforeEach(() => {
    questRepository = new InMemoryQuestRepository()
    characterRepository = new InMemoryCharacterRepository()
  })

  it('returns only quests belonging to the caller character', async () => {
    const characterA = characterRepository.seed({ userId: 'user-1', name: 'Hero A' })
    const characterB = characterRepository.seed({ userId: 'user-2', name: 'Hero B' })
    questRepository.seed({ characterId: characterA.id, title: 'Quest A1' })
    questRepository.seed({ characterId: characterA.id, title: 'Quest A2' })
    questRepository.seed({ characterId: characterB.id, title: 'Quest B1' })

    const useCase = new ListQuestsUseCase(questRepository, characterRepository)
    const result = await useCase.execute({ userId: 'user-1' })

    expect(result).toHaveLength(2)
    expect(result.map((q) => q.title).sort()).toEqual(['Quest A1', 'Quest A2'])
  })

  it('throws NotFoundError when the user has no character', async () => {
    const useCase = new ListQuestsUseCase(questRepository, characterRepository)

    await expect(useCase.execute({ userId: 'ghost-user' })).rejects.toThrow(NotFoundError)
  })

  it('lists active quests before completed/failed/expired ones', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    questRepository.seed({ characterId: character.id, title: 'Completed', status: 'completed' })
    questRepository.seed({ characterId: character.id, title: 'Available', status: 'available' })
    questRepository.seed({ characterId: character.id, title: 'Expired', status: 'expired' })
    questRepository.seed({ characterId: character.id, title: 'In Progress', status: 'in_progress' })
    questRepository.seed({ characterId: character.id, title: 'Failed', status: 'failed' })

    const useCase = new ListQuestsUseCase(questRepository, characterRepository)
    const result = await useCase.execute({ userId: 'user-1' })

    const statuses = result.map((q) => q.status)
    expect(statuses.slice(0, 2).sort()).toEqual(['available', 'in_progress'])
    expect(statuses.slice(2).sort()).toEqual(['completed', 'expired', 'failed'])
  })

  describe('view filter', () => {
    const DAY_MS = 24 * 60 * 60 * 1000

    it('"available" view only returns quests with status available and an unexpired (or absent) deadline', async () => {
      const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
      questRepository.seed({ characterId: character.id, title: 'Open ended', status: 'available' })
      questRepository.seed({
        characterId: character.id,
        title: 'Available, not expired yet',
        status: 'available',
        expiresAt: new Date(Date.now() + DAY_MS),
      })
      questRepository.seed({
        characterId: character.id,
        title: 'Available but past its deadline',
        status: 'available',
        expiresAt: new Date(Date.now() - DAY_MS),
      })
      questRepository.seed({ characterId: character.id, title: 'In progress', status: 'in_progress' })
      questRepository.seed({ characterId: character.id, title: 'Completed', status: 'completed' })

      const useCase = new ListQuestsUseCase(questRepository, characterRepository)
      const result = await useCase.execute({ userId: 'user-1', view: 'available' })

      expect(result.map((q) => q.title).sort()).toEqual(['Available, not expired yet', 'Open ended'])
    })

    it('"completed_or_expired" view returns completed quests resolved within the last 7 days', async () => {
      const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
      questRepository.seed({
        characterId: character.id,
        title: 'Completed recently',
        status: 'completed',
        completedAt: new Date(Date.now() - 3 * DAY_MS),
      })
      questRepository.seed({
        characterId: character.id,
        title: 'Completed too long ago',
        status: 'completed',
        completedAt: new Date(Date.now() - 8 * DAY_MS),
      })
      questRepository.seed({ characterId: character.id, title: 'Still available', status: 'available' })

      const useCase = new ListQuestsUseCase(questRepository, characterRepository)
      const result = await useCase.execute({ userId: 'user-1', view: 'completed_or_expired' })

      expect(result.map((q) => q.title)).toEqual(['Completed recently'])
    })

    it('"completed_or_expired" view treats a quest past its deadline as expired, using expiresAt as the resolution date', async () => {
      const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
      questRepository.seed({
        characterId: character.id,
        title: 'Expired recently',
        status: 'available',
        expiresAt: new Date(Date.now() - 2 * DAY_MS),
      })
      questRepository.seed({
        characterId: character.id,
        title: 'Expired long ago',
        status: 'available',
        expiresAt: new Date(Date.now() - 10 * DAY_MS),
      })
      questRepository.seed({
        characterId: character.id,
        title: 'Explicitly marked expired long ago',
        status: 'expired',
        expiresAt: new Date(Date.now() - 30 * DAY_MS),
      })

      const useCase = new ListQuestsUseCase(questRepository, characterRepository)
      const result = await useCase.execute({ userId: 'user-1', view: 'completed_or_expired' })

      expect(result.map((q) => q.title)).toEqual(['Expired recently'])
    })

    it('"completed_or_expired" view surfaces quests the expiration cron marked as failed, using expiresAt as the resolution date', async () => {
      const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
      questRepository.seed({
        characterId: character.id,
        title: 'Failed by the cron recently',
        status: 'failed',
        expiresAt: new Date(Date.now() - 4 * DAY_MS),
      })
      questRepository.seed({
        characterId: character.id,
        title: 'Failed by the cron too long ago',
        status: 'failed',
        expiresAt: new Date(Date.now() - 9 * DAY_MS),
      })

      const useCase = new ListQuestsUseCase(questRepository, characterRepository)
      const result = await useCase.execute({ userId: 'user-1', view: 'completed_or_expired' })

      expect(result.map((q) => q.title)).toEqual(['Failed by the cron recently'])
    })
  })
})
