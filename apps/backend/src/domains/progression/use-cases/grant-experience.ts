import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { ID } from '../../../shared/types/index'
import { NotFoundError } from '../../../shared/errors/app-error'
import type { ProgressionRepository } from '../repositories/progression-repository'
import { applyExperienceGain } from '../engines/progression.engine'
import { ATTRIBUTE_POINTS_PER_LEVEL, applyAutoAttributeGains } from '../engines/attribute.engine'
import { calculatePowerScore } from '../engines/power-score.engine'
import { createXPGrantedEvent } from '../events/xp-granted.event'
import { createLevelUpEvent } from '../events/level-up.event'
import { createAttributePointsGrantedEvent } from '../events/attribute-points-granted.event'

interface GrantExperienceInput {
  characterId: ID
  amount: number
  source: string
}

export class GrantExperienceUseCase {
  constructor(
    private readonly progressionRepository: ProgressionRepository,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event),
  ) {}

  async execute(input: GrantExperienceInput) {
    const progression = await this.progressionRepository.findByCharacterId(input.characterId)

    if (!progression) {
      throw new NotFoundError('CharacterProgression', input.characterId)
    }

    const result = applyExperienceGain(progression.level, progression.experience, input.amount)
    const levelsGainedCount = result.levelsGained.length

    const stats =
      levelsGainedCount > 0 ? applyAutoAttributeGains(progression.stats, levelsGainedCount) : progression.stats
    const powerScore = levelsGainedCount > 0 ? calculatePowerScore(stats) : progression.powerScore

    const updated = await this.progressionRepository.save(input.characterId, {
      level: result.level,
      experience: result.experience,
      stats,
      powerScore,
    })

    if (levelsGainedCount > 0) {
      await this.progressionRepository.addRestPoints(input.characterId, levelsGainedCount * ATTRIBUTE_POINTS_PER_LEVEL)
    }

    await this.publishEvent(createXPGrantedEvent(input.characterId, input.amount, input.source))

    for (const newLevel of result.levelsGained) {
      await this.publishEvent(createLevelUpEvent(input.characterId, newLevel - 1, newLevel))
      await this.publishEvent(createAttributePointsGrantedEvent(input.characterId, ATTRIBUTE_POINTS_PER_LEVEL))
    }

    return { progression: updated, levelsGained: result.levelsGained }
  }
}
