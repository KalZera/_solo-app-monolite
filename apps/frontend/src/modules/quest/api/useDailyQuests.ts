import { useQuery } from '@tanstack/react-query'
import { listQuests } from './quest.requests'
import type { Quest } from '../types'
import { startOfDay } from '@/shared/utils/date'

// A renewed daily quest is created immediately on completion but shouldn't surface
// until the calendar day it's meant for actually begins (00:00 of its expiry date).
function isVisibleToday(quest: Quest): boolean {
  if (!quest.expiresAt) return true
  return new Date() >= startOfDay(new Date(quest.expiresAt))
}

async function fetchDailyQuests() {
  const quests = await listQuests()
  return quests.filter((quest) => quest.type === 'daily' && isVisibleToday(quest))
}

export function useDailyQuests(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['quests', 'daily'],
    queryFn: fetchDailyQuests,
    enabled: options?.enabled ?? true,
  })
}
