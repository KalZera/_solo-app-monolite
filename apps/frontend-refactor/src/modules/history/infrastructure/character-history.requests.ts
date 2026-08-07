import { httpClient } from '@/shared/api/http-client'
import type { HistoryEntry, Paginated } from '../domain/history.types'

export function getCharacterHistory(params: {
  page: number
  pageSize: number
}): Promise<Paginated<HistoryEntry>> {
  return httpClient.get<Paginated<HistoryEntry>>('/characters/history', {
    query: { page: params.page, pageSize: params.pageSize },
  })
}
