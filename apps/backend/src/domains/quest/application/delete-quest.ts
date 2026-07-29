import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository } from '../domain/quest'
import { ConflictError, NotFoundError } from '../../../shared/errors/app-error'

interface DeleteQuestInput {
  userId: string
  questId: string
}

export class DeleteQuestUseCase {
  constructor (
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository
  ) {}

  async execute (input: DeleteQuestInput): Promise<void> {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const quest = await this.questRepository.findById(input.questId)

    if (!quest || quest.characterId !== character.id) {
      throw new NotFoundError('Quest', input.questId)
    }

    if (quest.status === 'in_progress') {
      throw new ConflictError('A quest already in progress cannot be removed')
    }

    if (quest.status === 'completed') {
      throw new ConflictError('A completed quest cannot be removed')
    }

    await this.questRepository.delete(quest.id)
  }
}
