import type { CharacterRepository } from '../domain/character'
import { calculatePowerScore } from '../../progression/engines/power-score.engine'
import { calculateRank } from '../../progression/engines/rank.engine'
import { NotFoundError } from '../../../shared/errors/app-error'

interface GetCharacterProfileInput {
  userId: string
}

export class GetCharacterProfileUseCase {
  constructor(private readonly repository: CharacterRepository) {}

  async execute(input: GetCharacterProfileInput) {
    const characters = await this.repository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const powerScore = calculatePowerScore(character.stats)
    const rank = calculateRank(powerScore)

    return { ...character, powerScore, rank }
  }
}
