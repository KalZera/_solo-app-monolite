import { useQuery } from '@tanstack/react-query'
import { listQuests } from './quest.requests'
import type { Quest } from '../types'
import { isSameCalendarDay } from '@/shared/utils/date'

// Daily quests renew every day, so old instances pile up over time. A past day's daily
// quest is only worth showing in the list if it's still unfinished business — hide it
// once it's completed, but keep it visible if it's expired or was never completed.
function isVisibleInList(quest: Quest): boolean {
  if (quest.type !== 'daily') return true
  if (!quest.expiresAt) return true
  if (isSameCalendarDay(new Date(quest.expiresAt), new Date())) return true
  return quest.status !== 'completed'
}

async function fetchQuests() {
  const quests = await listQuests()
  return quests.filter(isVisibleInList)
}

export function useQuests() {
  return useQuery({
    queryKey: ['quests', 'list'],
    queryFn: fetchQuests,
  })
}
