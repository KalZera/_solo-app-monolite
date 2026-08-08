import type { CharacterRepository } from '../domain/character'
import type { CharacterRestPointRepository } from '../domain/character-rest-point'
import { calculatePowerScore } from '../../progression/engines/power-score.engine'
import { calculateRank } from '../../progression/engines/rank.engine'
import { NotFoundError } from '../../../shared/errors/app-error'
import type { GetProgressionUseCase } from '@domains/progression/application/get-progression'

interface GetCharacterProfileInput {
  userId: string
}

export class GetCharacterProfileUseCase {
  constructor (
    private readonly repository: CharacterRepository,
    private readonly restPointRepository: CharacterRestPointRepository,
    private readonly progression: GetProgressionUseCase
  ) {}

  async execute (input: GetCharacterProfileInput) {
    const characters = await this.repository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const powerScore = calculatePowerScore(character.stats)
    const rank = calculateRank(powerScore)
    const progressionPoint = await this.progression.execute({userId:input.userId})
    const restPoint = await this.restPointRepository.findByCharacterId(character.id)

    return { ...character, powerScore, rank, restPoints: restPoint?.restPoints ?? 0, progression:progressionPoint }
  }
}
