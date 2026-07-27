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

  findByCharacterId(characterId: ID): CharacterRestPoint | undefined {
    return this.restPoints.find((record) => record.characterId === characterId)
  }
}
