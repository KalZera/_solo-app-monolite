import { useQuery } from '@tanstack/react-query'
import { mockDailyQuests } from './quest.mock'

async function fetchDailyQuests() {
  // TODO: swap for `httpClient.get('/quests/daily')` once the quest domain ships
  return mockDailyQuests
}

export function useDailyQuests() {
  return useQuery({
    queryKey: ['quests', 'daily'],
    queryFn: fetchDailyQuests,
  })
}
