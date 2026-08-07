import type { ID } from '../../../shared/types/index'
import { NotFoundError } from '../../../shared/errors/app-error'
import type { ProgressionRepository } from '../repositories/progression-repository'
import type { CharacterProgression } from '../entities/character-progression'
import { ATTRIBUTE_POINTS_PER_LEVEL, applyAutoAttributeGains } from '../engines/attribute.engine'
import { calculatePowerScore } from '../engines/power-score.engine'

interface ApplyLevelUpInput {
  characterId: ID
  newLevel: number
}

// Applies everything a single level gain grants: the new level itself, the automatic
// +1 to every attribute, the recalculated power score, and the rest points the player
// can spend freely — persisted atomically (ProgressionRepository.saveWithRestPoints)
// so the level can never be saved without also crediting its rest points.
//
// This is triggered by the 'LevelUp' subscriber (infrastructure/events/progression-plugin.ts),
// not called directly from GrantExperienceUseCase, so granting XP stays decoupled from what
// a level-up actually does to the character.
export class ApplyLevelUpUseCase {
  constructor (private readonly progressionRepository: ProgressionRepository) {}

  async execute (input: ApplyLevelUpInput): Promise<CharacterProgression> {
    const progression = await this.progressionRepository.findByCharacterId(input.characterId)

    if (!progression) {
      throw new NotFoundError('Character', input.characterId)
    }

    const stats = applyAutoAttributeGains(progression.stats, 1)
    const powerScore = calculatePowerScore(stats)

    return this.progressionRepository.saveWithRestPoints(
      input.characterId,
      { level: input.newLevel, stats, powerScore },
      ATTRIBUTE_POINTS_PER_LEVEL
    )
  }
}
