/** A character history entry as returned by GET /characters/history. */
export interface HistoryEntry {
  id: string
  characterId: string
  description: string
  createdAt: string
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
