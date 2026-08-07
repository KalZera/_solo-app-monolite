import { useQuery } from '@tanstack/react-query'
import { getQuestsByTab, type QuestTab } from '../infrastructure/quest.requests'
import { questKeys } from './quest.keys'

/** The exact set of instances for the given Quest List tab, decided server-side. */
export function useQuestsByTab(tab: QuestTab) {
  return useQuery({
    queryKey: questKeys.byTab(tab),
    queryFn: () => getQuestsByTab(tab),
    retry: false,
  })
}
