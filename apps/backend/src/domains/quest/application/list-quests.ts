import type { CharacterRepository } from '../../character/domain/character'
import type { QuestParsed  } from '../domain/quest'
import type { QuestInstanceRepository } from '../domain/quest-instance'
import { NotFoundError } from '../../../shared/errors/app-error'
import type { Recurrence } from '../domain/recurrence'

interface ListQuestsInput {
  userId: string,
  tab?: Recurrence
}

// Lists the character's quest TEMPLATES.
export class ListQuestsUseCase {
  constructor (
    private readonly questRepository: QuestInstanceRepository,
    private readonly characterRepository: CharacterRepository
  ) {}

  async execute (input: ListQuestsInput): Promise<QuestParsed[]> {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const quests = await this.questRepository.findByCharacterId(character.id)
    const parsedQuests = quests
      .filter((quest) => quest.id !== undefined)
      .map((quest) => {
        const { quest: questTemplate, ...questInstance } = quest
        return {
          ...questTemplate,
          instance: {
            ...questInstance
          }
        }
      })

    return parsedQuests as QuestParsed[]
  }
}
