import type { CharacterRepository, CharacterStats } from '../domain/character'
import type { CharacterRestPointRepository } from '../domain/character-rest-point'
import { calculatePowerScore } from '../../progression/engines/power-score.engine'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import { createAttributePointAllocatedEvent } from '../domain/events'

type AllocatableAttribute = keyof CharacterStats

const ALLOCATABLE_ATTRIBUTES: AllocatableAttribute[] = [
  'strength',
  'intelligence',
  'agility',
  'vitality',
  'luck',
]

// Business rule: keeps the build from getting too lopsided — no attribute may end up more
// than this many points ahead of the character's lowest attribute.
const MAX_ATTRIBUTE_DIFFERENCE = 20

interface AllocateAttributePointsInput {
  userId: string
  allocations: Partial<Record<AllocatableAttribute, number>>
}

export class AllocateAttributePointsUseCase {
  constructor (
    private readonly characterRepository: CharacterRepository,
    private readonly restPointRepository: CharacterRestPointRepository,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (input: AllocateAttributePointsInput) {
    const rawEntries = Object.entries(input.allocations) as [AllocatableAttribute, number | undefined][]

    for (const [attribute, amount] of rawEntries) {
      if (amount === undefined) continue

      if (!ALLOCATABLE_ATTRIBUTES.includes(attribute)) {
        throw new ValidationError(`Attribute must be one of: ${ALLOCATABLE_ATTRIBUTES.join(', ')}`)
      }
      if (!Number.isInteger(amount) || amount < 0) {
        throw new ValidationError('Amount must be a non-negative whole number')
      }
    }
    // remove all attribute that is 0 or undefined
    const entries = rawEntries.filter(
      (entry): entry is [AllocatableAttribute, number] => (entry[1] ?? 0) > 0
    )

    if (entries.length === 0) {
      throw new ValidationError('At least one attribute allocation is required')
    }

    const totalAmount = entries.reduce((sum, [, amount]) => sum + amount, 0)

    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const restPoint = await this.restPointRepository.findByCharacterId(character.id)

    if (!restPoint || restPoint.restPoints < totalAmount) {
      throw new ConflictError('Not enough rest points available')
    }

    const stats: CharacterStats = { ...character.stats }
    for (const [attribute, amount] of entries) {
      stats[attribute] += amount
    }
    
    const statValues = ALLOCATABLE_ATTRIBUTES.map((attribute) => stats[attribute])
    const attributeDifference = Math.max(...statValues) - Math.min(...statValues)

    if (attributeDifference > MAX_ATTRIBUTE_DIFFERENCE) {
      throw new ValidationError(
        `Attributes cannot differ by more than ${MAX_ATTRIBUTE_DIFFERENCE} points from each other`
      )
    }

    const updatedCharacter = await this.characterRepository.save(character.id, {
      stats,
      powerScore: calculatePowerScore(stats),
    })

    const updatedRestPoint = await this.restPointRepository.save(
      character.id,
      restPoint.restPoints - totalAmount
    )

    for (const [attribute, amount] of entries) {
      await this.publishEvent(createAttributePointAllocatedEvent(character.id, attribute, amount))
    }

    return { character: updatedCharacter, restPoints: updatedRestPoint.restPoints }
  }
}
