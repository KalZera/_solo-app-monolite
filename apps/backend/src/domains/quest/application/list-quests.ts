import type { CharacterRepository } from '../../character/domain/character'
import type { Quest, QuestRepository  } from '../domain/quest'
import { NotFoundError } from '../../../shared/errors/app-error'
import type { Recurrence } from '../domain/recurrence'

interface ListQuestsInput {
  userId: string,
  tab?: Recurrence
}

// Lists the character's quest TEMPLATES.
export class ListQuestsUseCase {
  constructor (
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository
  ) {}

  async execute (input: ListQuestsInput): Promise<Quest[]> {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    return this.questRepository.findByCharacterId(character.id, input.tab?.toUpperCase() as Recurrence)
  }
}
