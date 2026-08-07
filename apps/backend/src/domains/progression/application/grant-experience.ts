import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { ID } from '../../../shared/types/index'
import { NotFoundError } from '../../../shared/errors/app-error'
import { ProgressionEngine } from '../engines/progression.engine'
import { ATTRIBUTE_POINTS_PER_LEVEL } from '../engines/attribute.engine'
import { createXPGrantedEvent } from '../events/xp-granted.event'
import { createLevelUpEvent } from '../events/level-up.event'
import { createAttributePointsGrantedEvent } from '../events/attribute-points-granted.event'
import { ApplyLevelUpUseCase } from './apply-level-up'
import type { CharacterRepository } from '@domains/character/domain/character'

interface GrantExperienceInput {
  characterId: ID
  amount: number
  source: string
}

// Grants XP and, if enough was gained to cross the threshold, applies the level-up
// (ApplyLevelUpUseCase) synchronously before returning — a level-up is not an optional
// side effect of granting XP, it's part of the same business transaction, so the caller
// can always rely on the returned character already reflecting the new level. The
// 'LevelUp'/'AttributePointsGranted' events are published only *after* that persistence,
// as facts, for peripheral consumers (e.g. character-history-plugin's history feed).
export class GrantExperienceUseCase {
  constructor (
    private readonly characterRepository: CharacterRepository,
    private readonly applyLevelUp: ApplyLevelUpUseCase,
    private readonly engine: ProgressionEngine = new ProgressionEngine(),
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (input: GrantExperienceInput) {
    const character = await this.characterRepository.findById(input.characterId)

    if (!character) {
      throw new NotFoundError('Character', input.characterId)
    }

    const newExperience = character.experience + input.amount

    let updatedCharacter = await this.characterRepository.save(input.characterId, {
      ...character,
      experience: newExperience
    })

    await this.publishEvent(createXPGrantedEvent(input.characterId, input.amount, input.source))

    const experienceToNextLevel = this.engine.calculateTotalXpForLevel(character.level + 1)

    if (newExperience >= experienceToNextLevel) {
      const newLevel = character.level + 1
      const progression = await this.applyLevelUp.execute({ characterId: input.characterId, newLevel })

      updatedCharacter = {
        ...updatedCharacter,
        level: progression.level,
        stats: progression.stats,
        powerScore: progression.powerScore,
      }

      await this.publishEvent(createLevelUpEvent(input.characterId, character.level, newLevel))
      await this.publishEvent(createAttributePointsGrantedEvent(input.characterId, ATTRIBUTE_POINTS_PER_LEVEL))
    }

    return { character: updatedCharacter }
  }
}
