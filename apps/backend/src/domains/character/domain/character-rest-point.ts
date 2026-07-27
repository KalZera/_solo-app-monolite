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
}
