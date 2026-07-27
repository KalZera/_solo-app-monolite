import { randomUUID } from 'crypto'
import type { CharacterRestPoint, CharacterRestPointRepository } from '../domain/character-rest-point'
import type { ID } from '../../../shared/types/index'

export class InMemoryCharacterRestPointRepository implements CharacterRestPointRepository {
  private restPoints: CharacterRestPoint[] = []

  async create(characterId: ID): Promise<CharacterRestPoint> {
    const record: CharacterRestPoint = {
      id: randomUUID(),
      characterId,
      restPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.restPoints.push(record)
    return record
  }

  async findByCharacterId(characterId: ID): Promise<CharacterRestPoint | null> {
    return this.restPoints.find((record) => record.characterId === characterId) ?? null
  }

  async save(characterId: ID, restPoints: number): Promise<CharacterRestPoint> {
    const record = this.restPoints.find((r) => r.characterId === characterId)
    if (!record) throw new Error(`CharacterRestPoint for character ${characterId} not found`)
    record.restPoints = restPoints
    record.updatedAt = new Date()
    return record
  }

  // Test-only helper used by InMemoryProgressionRepository, which shares this store
  // the same way PrismaProgressionRepository shares the characters_rest_points table.
  async incrementRestPoints(characterId: ID, amount: number): Promise<CharacterRestPoint> {
    let record = this.restPoints.find((r) => r.characterId === characterId)
    if (!record) {
      record = await this.create(characterId)
    }
    record.restPoints += amount
    record.updatedAt = new Date()
    return record
  }
}
