import type { ID, Paginated, PaginationParams } from '../../../shared/types/index'

// One entry per type, carrying just the raw facts needed to render a translated sentence
// client-side (e.g. { questTitle } or { level }) — never a pre-rendered, fixed-language string.
export type CharacterHistoryEntryType =
  | 'QUEST_COMPLETED'
  | 'QUEST_FAILED'
  | 'QUEST_EXPIRED'
  | 'LEVEL_UP'
  | 'ATTRIBUTE_POINTS_GRANTED'
  | 'ATTRIBUTE_POINT_ALLOCATED'

export interface CharacterHistory {
  id: ID
  characterId: ID
  type: CharacterHistoryEntryType
  payload: Record<string, unknown>
  createdAt: Date
}

export interface CharacterHistoryRepository {
  create(
    characterId: ID,
    type: CharacterHistoryEntryType,
    payload: Record<string, unknown>
  ): Promise<CharacterHistory>
  findByCharacterId(characterId: ID, pagination: PaginationParams): Promise<Paginated<CharacterHistory>>
}
