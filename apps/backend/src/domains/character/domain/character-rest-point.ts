import type { ID } from '../../../shared/types/index'

export interface CharacterRestPoint {
  id: ID
  characterId: ID
  restPoints: number
  createdAt: Date
  updatedAt: Date
}

export interface CharacterRestPointRepository {
  create(characterId: ID): Promise<CharacterRestPoint>
  findByCharacterId(characterId: ID): Promise<CharacterRestPoint | null>
  save(characterId: ID, restPoints: number): Promise<CharacterRestPoint>
}
