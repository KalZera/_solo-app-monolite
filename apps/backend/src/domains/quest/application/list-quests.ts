import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository, QuestFilter } from '../domain/quest'
import { ACTIVE_QUEST_STATUSES } from '../domain/quest'
import { NotFoundError } from '../../../shared/errors/app-error'

interface ListQuestsInput {
  userId: string
  filter?: QuestFilter
}

export class ListQuestsUseCase {
  constructor (
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository
  ) {}

  async execute (input: ListQuestsInput) {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    console.log({ filter: input.filter })

    const quests =
      input.filter !== undefined
        ? (await this.questRepository.findByData({ ...input.filter }, { page: 1, pageSize: 10 })).data
        : await this.questRepository.findByCharacterId(character.id)

    // Active quests (available/in_progress) surface before completed/failed/expired ones.
    return quests.sort((a, b) => {
      const aInactive = Number(!ACTIVE_QUEST_STATUSES.includes(a.status))
      const bInactive = Number(!ACTIVE_QUEST_STATUSES.includes(b.status))
      return aInactive - bInactive
    })
  }
}
