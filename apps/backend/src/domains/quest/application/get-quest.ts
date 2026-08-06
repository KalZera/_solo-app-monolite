import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository } from '../domain/quest'
import { NotFoundError } from '../../../shared/errors/app-error'
import type { QuestInstanceRepository } from '../domain/quest-instance'

interface GetQuestInput {
  userId: string
  questInstanceId: string
}

export class GetQuestUseCase {
  constructor (
    private readonly questInstanceRepository: QuestInstanceRepository,
    private readonly characterRepository: CharacterRepository
  ) {}

  async execute (input: GetQuestInput) {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }
    
    const quest = await this.questInstanceRepository.findById(input.questInstanceId)

    if (!quest || quest?.quest?.characterId !== character.id) {
      throw new NotFoundError('Quest', input.questInstanceId)
    }

    return quest
  }
}