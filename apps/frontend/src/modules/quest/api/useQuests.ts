import { useQuery } from '@tanstack/react-query'
import { listQuests } from './quest.requests'

export function useQuests() {
  return useQuery({
    queryKey: ['quests', 'list'],
    queryFn: listQuests,
  })
}
