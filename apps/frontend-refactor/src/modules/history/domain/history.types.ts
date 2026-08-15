import type { StatKey } from '@/modules/profile/domain/character.types'

/**
 * A character history entry as returned by GET /characters/history. Structured (type + payload)
 * rather than a pre-rendered sentence, so HistoryEntryRow can translate it via i18n at read time
 * instead of displaying backend-baked, fixed-language text.
 */
export type HistoryEntry =
  | HistoryEntryBase<'QUEST_COMPLETED', { questTitle: string }>
  | HistoryEntryBase<'QUEST_FAILED', { questTitle: string }>
  | HistoryEntryBase<'QUEST_EXPIRED', { questTitle: string }>
  | HistoryEntryBase<'LEVEL_UP', { level: number }>
  | HistoryEntryBase<'ATTRIBUTE_POINTS_GRANTED', { points: number }>
  | HistoryEntryBase<'ATTRIBUTE_POINT_ALLOCATED', { amount: number; attribute: StatKey }>

interface HistoryEntryBase<Type extends string, Payload> {
  id: string
  characterId: string
  type: Type
  payload: Payload
  createdAt: string
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
