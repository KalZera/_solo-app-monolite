import type { CharacterRepository, CharacterStats } from '../domain/character'
import type { CharacterRestPointRepository } from '../domain/character-rest-point'
import { calculatePowerScore } from '../../progression/engines/power-score.engine'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import { createAttributePointAllocatedEvent } from '../domain/events'

type AllocatableAttribute = keyof CharacterStats

const ALLOCATABLE_ATTRIBUTES: AllocatableAttribute[] = ['strength', 'intelligence', 'agility', 'vitality', 'luck']

interface AllocateAttributePointInput {
  userId: string
  attribute: AllocatableAttribute
  amount: number
}

export class AllocateAttributePointUseCase {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly restPointRepository: CharacterRestPointRepository,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event),
  ) {}

  async execute(input: AllocateAttributePointInput) {
    if (!ALLOCATABLE_ATTRIBUTES.includes(input.attribute)) {
      throw new ValidationError(`Attribute must be one of: ${ALLOCATABLE_ATTRIBUTES.join(', ')}`)
    }

    if (!Number.isInteger(input.amount) || input.amount <= 0) {
      throw new ValidationError('Amount must be a positive whole number')
    }

    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const restPoint = await this.restPointRepository.findByCharacterId(character.id)

    if (!restPoint || restPoint.restPoints < input.amount) {
      throw new ConflictError('Not enough rest points available')
    }

    const stats: CharacterStats = {
      ...character.stats,
      [input.attribute]: character.stats[input.attribute] + input.amount,
    }

    const updatedCharacter = await this.characterRepository.save(character.id, {
      stats,
      powerScore: calculatePowerScore(stats),
    })

    const updatedRestPoint = await this.restPointRepository.save(character.id, restPoint.restPoints - input.amount)

    await this.publishEvent(createAttributePointAllocatedEvent(character.id, input.attribute, input.amount))

    return { character: updatedCharacter, restPoints: updatedRestPoint.restPoints }
  }
}
