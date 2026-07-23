import type { CharacterRepository } from '../domain/character'
import { NotFoundError } from '../../../shared/errors/app-error'

interface DeleteCharacterInput {
  userId: string
}

export class DeleteCharacterUseCase {
  constructor(private readonly repository: CharacterRepository) {}

  async execute(input: DeleteCharacterInput): Promise<void> {
    const characters = await this.repository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    await this.repository.delete(character.id)
  }
}
