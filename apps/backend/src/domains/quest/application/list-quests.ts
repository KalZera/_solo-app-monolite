import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository, QuestFilter, QuestView } from '../domain/quest'
import { ACTIVE_QUEST_STATUSES, isQuestAvailable, isQuestVisibleInCompletedOrExpiredView } from '../domain/quest'
import { NotFoundError } from '../../../shared/errors/app-error'

interface ListQuestsInput {
  userId: string
  filter?: QuestFilter
  view?: QuestView
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

    const quests =
      input.filter !== undefined
        ? (await this.questRepository.findByData({ ...input.filter, characterId: character.id }, { page: 1, pageSize: 10 })).data
        : await this.questRepository.findByCharacterId(character.id)

    const filteredQuests = this.applyView(quests, input.view)

    // Active quests (available/in_progress) surface before completed/failed/expired ones.
    return filteredQuests.sort((a, b) => {
      const aInactive = Number(!ACTIVE_QUEST_STATUSES.includes(a.status))
      const bInactive = Number(!ACTIVE_QUEST_STATUSES.includes(b.status))
      return aInactive - bInactive
    })
  }

  private applyView (quests: Awaited<ReturnType<QuestRepository['findByCharacterId']>>, view?: QuestView) {
    if (view === 'available') return quests.filter((quest) => isQuestAvailable(quest))
    if (view === 'completed_or_expired') return quests.filter((quest) => isQuestVisibleInCompletedOrExpiredView(quest))
    return quests
  }
}
