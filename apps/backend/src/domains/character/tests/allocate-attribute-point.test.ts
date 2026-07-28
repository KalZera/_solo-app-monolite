import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AllocateAttributePointUseCase } from '../application/allocate-attribute-point'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { InMemoryCharacterRepository } from '../infrastructure/in-memory-character-repository'
import { InMemoryCharacterRestPointRepository } from '../infrastructure/in-memory-character-rest-point-repository'
import type { DomainEvent } from '../../../shared/events/domain-event'

describe('AllocateAttributePointUseCase', () => {
  let characterRepository: InMemoryCharacterRepository
  let restPointRepository: InMemoryCharacterRestPointRepository
  let publishEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    restPointRepository = new InMemoryCharacterRestPointRepository()
    publishEvent = vi.fn().mockResolvedValue(undefined)
  })

  function buildUseCase() {
    return new AllocateAttributePointUseCase(characterRepository, restPointRepository, publishEvent)
  }

  it('spends rest points to increase an attribute and recalculates power score', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 5)

    const result = await buildUseCase().execute({ userId: 'user-1', attribute: 'strength', amount: 3 })

    expect(result.character.stats.strength).toBe(4)
    expect(result.character.powerScore).toBe(8)
    expect(result.restPoints).toBe(2)

    const events = publishEvent.mock.calls.map((call) => call[0] as DomainEvent)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      eventType: 'AttributePointAllocated',
      characterId: character.id,
      attribute: 'strength',
      amount: 3,
    })
  })

  it('throws ConflictError when there are not enough rest points', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 2)

    await expect(
      buildUseCase().execute({ userId: 'user-1', attribute: 'strength', amount: 3 }),
    ).rejects.toThrow(ConflictError)
  })

  it('throws ConflictError when the character has no rest points record yet', async () => {
    characterRepository.seed({ userId: 'user-1', name: 'Hero' })

    await expect(
      buildUseCase().execute({ userId: 'user-1', attribute: 'strength', amount: 1 }),
    ).rejects.toThrow(ConflictError)
  })

  it('throws ValidationError for an unknown attribute', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 5)

    await expect(
      buildUseCase().execute({ userId: 'user-1', attribute: 'charisma' as never, amount: 1 }),
    ).rejects.toThrow(ValidationError)
  })

  it('throws ValidationError for a non-positive amount', async () => {
    const character = characterRepository.seed({ userId: 'user-1', name: 'Hero' })
    await restPointRepository.incrementRestPoints(character.id, 5)

    await expect(
      buildUseCase().execute({ userId: 'user-1', attribute: 'strength', amount: 0 }),
    ).rejects.toThrow(ValidationError)
  })

  it('throws NotFoundError when the user has no character', async () => {
    await expect(
      buildUseCase().execute({ userId: 'ghost-user', attribute: 'strength', amount: 1 }),
    ).rejects.toThrow(NotFoundError)
  })
})
