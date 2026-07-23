import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository } from '../domain/quest'
import { NotFoundError } from '../../../shared/errors/app-error'

interface ListQuestsInput {
  userId: string
}

export class ListQuestsUseCase {
  constructor(
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(input: ListQuestsInput) {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    return this.questRepository.findByCharacterId(character.id)
  }
}
