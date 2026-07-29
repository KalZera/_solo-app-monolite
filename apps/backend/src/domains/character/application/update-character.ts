import type { CharacterClass, CharacterRepository, CharacterStats } from '../domain/character'
import { calculatePowerScore } from '../../progression/engines/power-score.engine'
import { NotFoundError } from '../../../shared/errors/app-error'

interface UpdateCharacterInput {
  userId: string
  name?: string
  title?: string
  class?: CharacterClass
  avatar?: string | null
  stats?: Partial<CharacterStats>
}

export class UpdateCharacterUseCase {
  constructor (private readonly repository: CharacterRepository) {}

  async execute (input: UpdateCharacterInput) {
    const characters = await this.repository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const stats = { ...character.stats, ...input.stats }

    return this.repository.save(character.id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.class !== undefined && { class: input.class }),
      ...(input.avatar !== undefined && { avatar: input.avatar }),
      stats,
      powerScore: calculatePowerScore(stats),
    })
  }
}
