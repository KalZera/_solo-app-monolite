import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AllocateAttributePointsUseCase } from '../application/allocate-attribute-points'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { InMemoryCharacterRepository } from '../infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../infrastructure/in-memory-character-rest-point-repository'
import type { DomainEvent } from '../../../shared/events/domain-event'

describe('AllocateAttributePointsUseCase', () => {
  let characterRepository: InMemoryCharacterRepository
  let restPointRepository: InMemoryCharacterRestPointRepository
  let publishEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    restPointRepository = new InMemoryCharacterRestPointRepository()
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  function buildUseCase () {
    return new AllocateAttributePointsUseCase(characterRepository, restPointRepository, publishEvent)
  }

  it('spends rest points across several attributes in one call and recalculates power score once', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 5)

    const result = await buildUseCase().execute({
      userId: 'user-1',
      allocations: { strength: 2, perception: 1 },
    })

    expect(result.character.stats).toMatchObject({ strength: 3, perception: 2 })
    expect(result.character.powerScore).toBe(8)
    expect(result.restPoints).toBe(2)

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(2)
    expect(events).toContainEqual(
      expect.objectContaining({ eventType: 'AttributePointAllocated', attribute: 'strength', amount: 2 })
    )
    expect(events).toContainEqual(
      expect.objectContaining({ eventType: 'AttributePointAllocated', attribute: 'perception', amount: 1 })
    )
  })

  it('ignores zero-amount attributes instead of allocating or erroring on them', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 5)

    const result = await buildUseCase().execute({
      userId: 'user-1',
      allocations: { strength: 2, agility: 0, vitality: 0 },
    })

    expect(result.character.stats).toMatchObject({ strength: 3, agility: 1, vitality: 1 })
    expect(publishEvent).toHaveBeenCalledTimes(1)
  })

  it('throws ConflictError when the combined amount exceeds available rest points', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 4)

    await expect(
      buildUseCase().execute({ userId: 'user-1', allocations: { strength: 2, perception: 3 } })
    ).rejects.toThrow(ConflictError)
  })

  it('throws ConflictError when the character has no rest points record yet', async () => {
    characterRepository.seed({ userId: 'user-1', name: 'Hero' })

    await expect(
      buildUseCase().execute({ userId: 'user-1', allocations: { strength: 1 } })
    ).rejects.toThrow(ConflictError)
  })

  it('throws ValidationError for an unknown attribute', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 5)

    await expect(
      buildUseCase().execute({ userId: 'user-1', allocations: { charisma: 1 } as never })
    ).rejects.toThrow(ValidationError)
  })

  it('throws ValidationError for a negative amount', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 5)

    await expect(
      buildUseCase().execute({ userId: 'user-1', allocations: { strength: -1 } })
    ).rejects.toThrow(ValidationError)
  })

  it('throws ValidationError when every allocation is zero', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 5)

    await expect(
      buildUseCase().execute({ userId: 'user-1', allocations: { strength: 0, perception: 0 } })
    ).rejects.toThrow(ValidationError)
  })

  it('throws ValidationError when an attribute would end up more than 20 points ahead of the lowest one', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 21)

    await expect(
      buildUseCase().execute({ userId: 'user-1', allocations: { strength: 21 } })
    ).rejects.toThrow(ValidationError)
  })

  it('allows a distribution that leaves exactly a 20-point gap between attributes', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 20)

    const result = await buildUseCase().execute({
      userId: 'user-1',
      allocations: { strength: 20 },
    })

    expect(result.character.stats.strength).toBe(21)
  })

  it('throws NotFoundError when the user has no character', async () => {
    await expect(
      buildUseCase().execute({ userId: 'ghost-user', allocations: { strength: 1 } })
    ).rejects.toThrow(NotFoundError)
  })
})
