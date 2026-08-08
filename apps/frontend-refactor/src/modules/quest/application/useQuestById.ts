import { useQuery } from '@tanstack/react-query'
import { getQuestById } from '../infrastructure/quest.requests'


export function useQuestsById(id: string) {
  return useQuery({
    queryKey: ['quests', id],
    queryFn: () => getQuestById(id)
  })
}
