import type { CharacterRepository } from '../../character/domain/character'
import type { QuestRepository } from '../domain/quest'
import { NotFoundError } from '../../../shared/errors/app-error'

interface DeleteQuestInput {
  userId: string
  questId: string
}

// Deletes the TEMPLATE. Its QuestInstances (and their objectives) are removed by the
// onDelete: Cascade relations. Prefer deactivating (active=false) to preserve history.
export class DeleteQuestUseCase {
  constructor (
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository
  ) {}

  async execute (input: DeleteQuestInput): Promise<void> {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null
    if (!character) throw new NotFoundError('Character', input.userId)

    const quest = await this.questRepository.findById(input.questId)
    if (!quest || quest.characterId !== character.id) {
      throw new NotFoundError('Quest', input.questId)
    }

    await this.questRepository.delete(quest.id)
  }
}
