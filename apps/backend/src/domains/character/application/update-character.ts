import type { CharacterClass, CharacterRepository } from '../domain/character'
import { NotFoundError } from '../../../shared/errors/app-error'

// Only cosmetic/profile fields are editable here. Name is immutable after creation
// (Decisão #4) and attributes change exclusively through AllocateAttributePointUseCase
// (Decisão CARD-101) — never mass-assigned from the request body. Title stays editable
// (Decisão #3).
interface UpdateCharacterInput {
  userId: string
  title?: string
  class?: CharacterClass
  avatar?: string | null
}

export class UpdateCharacterUseCase {
  constructor (private readonly repository: CharacterRepository) {}

  async execute (input: UpdateCharacterInput) {
    const characters = await this.repository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    return this.repository.save(character.id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.class !== undefined && { class: input.class }),
      ...(input.avatar !== undefined && { avatar: input.avatar }),
    })
  }
}
