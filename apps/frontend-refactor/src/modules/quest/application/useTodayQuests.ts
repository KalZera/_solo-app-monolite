import { useQuery } from '@tanstack/react-query'
import { getTodayQuests } from '../infrastructure/quest.requests'
import { questKeys } from './quest.keys'

/** Today's quest instances (materialised server-side). Retry off: a 404 means
 * no character yet and shouldn't be hammered. */
export function useTodayQuests(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: questKeys.today(),
    queryFn: getTodayQuests,
    retry: false,
    enabled: options?.enabled ?? true,
  })
}
