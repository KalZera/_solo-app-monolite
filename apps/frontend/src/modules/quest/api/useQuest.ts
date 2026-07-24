import { useQuery } from '@tanstack/react-query'
import { getQuest } from './quest.requests'

export function useQuest(questId: string) {
  return useQuery({
    queryKey: ['quests', 'detail', questId],
    queryFn: () => getQuest(questId),
    enabled: Boolean(questId),
  })
}
