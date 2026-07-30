import { useQuery } from '@tanstack/react-query'
import { listQuests } from './quest.requests'
import type { QuestView } from '../types'

export function useQuests(view?: QuestView) {
  return useQuery({
    queryKey: ['quests', 'list', view],
    queryFn: () => listQuests(view),
  })
}
