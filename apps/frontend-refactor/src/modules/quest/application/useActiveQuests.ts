import { useQuery } from '@tanstack/react-query'
import { getActiveQuests } from '../infrastructure/quest.requests'
import { questKeys } from './quest.keys'

/** Backend-filtered active executions (open/in-progress, not expired/completed). */
export function useActiveQuests(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: questKeys.active(),
    queryFn: getActiveQuests,
    retry: false,
    enabled: options?.enabled ?? true,
  })
}
