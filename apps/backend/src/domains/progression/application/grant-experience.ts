import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { ID } from '../../../shared/types/index'
import { NotFoundError } from '../../../shared/errors/app-error'
import { ProgressionEngine } from '../engines/progression.engine'
import { ATTRIBUTE_POINTS_PER_LEVEL } from '../engines/attribute.engine'
import { createXPGrantedEvent } from '../events/xp-granted.event'
import { createLevelUpEvent } from '../events/level-up.event'
import { createAttributePointsGrantedEvent } from '../events/attribute-points-granted.event'
import type { CharacterRepository } from '@domains/character/domain/character'

interface GrantExperienceInput {
  characterId: ID
  amount: number
  source: string
}

// Grants XP and detects a level-up crossing, but does not apply what a level-up
// actually does to the character (new level, stats, power score, rest points) —
// that lives in ApplyLevelUpUseCase, triggered by the 'LevelUp' subscriber in
// infrastructure/events/progression-plugin.ts.
export class GrantExperienceUseCase {
  constructor (
    private readonly characterRepository: CharacterRepository,
    private readonly engine: ProgressionEngine = new ProgressionEngine(),
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (input: GrantExperienceInput) {
    const character = await this.characterRepository.findById(input.characterId)

    if (!character) {
      throw new NotFoundError('Character', input.characterId)
    }

    const newExperience = character.experience + input.amount

    const updateCharacter = await this.characterRepository.save(input.characterId, {
      ...character,
      experience: newExperience
    })

    await this.publishEvent(createXPGrantedEvent(input.characterId, input.amount, input.source))

    const ExperienceToNextLevel = this.engine.calculateTotalXpForLevel(character.level + 1)

    if(newExperience >= ExperienceToNextLevel) {
      await this.publishEvent(createLevelUpEvent(input.characterId, character.level, character.level + 1))
      await this.publishEvent(createAttributePointsGrantedEvent(input.characterId, ATTRIBUTE_POINTS_PER_LEVEL))
    }

    return { character: updateCharacter }
  }
}
