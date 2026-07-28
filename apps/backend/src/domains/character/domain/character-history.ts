import type { ID, Paginated, PaginationParams } from '../../../shared/types/index'

export interface CharacterHistory {
  id: ID
  characterId: ID
  description: string
  createdAt: Date
}

export interface CharacterHistoryRepository {
  create(characterId: ID, description: string): Promise<CharacterHistory>
  findByCharacterId(characterId: ID, pagination: PaginationParams): Promise<Paginated<CharacterHistory>>
}
