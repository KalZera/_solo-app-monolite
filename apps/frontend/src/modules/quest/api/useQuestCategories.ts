import { useQuery } from '@tanstack/react-query'
import { listQuestCategories } from './quest.requests'

export function useQuestCategories() {
  return useQuery({
    queryKey: ['quests', 'categories'],
    queryFn: listQuestCategories,
  })
}
