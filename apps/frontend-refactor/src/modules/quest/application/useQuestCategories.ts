import { useQuery } from '@tanstack/react-query'
import { listQuestCategories } from '../infrastructure/quest.requests'
import { questKeys } from './quest.keys'

// Categories are optional context for the create form — a failure shouldn't block it.
export function useQuestCategories() {
  return useQuery({
    queryKey: questKeys.categories(),
    queryFn: listQuestCategories,
    retry: false,
  })
}
