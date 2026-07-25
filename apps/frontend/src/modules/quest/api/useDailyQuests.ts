import { useQuery } from '@tanstack/react-query'
import { listQuests } from './quest.requests'

async function fetchDailyQuests() {
  const quests = await listQuests()
  return quests.filter((quest) => quest.type === 'daily')
}

export function useDailyQuests(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['quests', 'daily'],
    queryFn: fetchDailyQuests,
    enabled: options?.enabled ?? true,
  })
}
