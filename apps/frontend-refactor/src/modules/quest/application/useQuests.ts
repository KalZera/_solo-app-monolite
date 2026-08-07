import { useQuery } from '@tanstack/react-query'
import { listQuests } from '../infrastructure/quest.requests'
import { questKeys } from './quest.keys'

export function useQuests() {
  return useQuery({
    queryKey: questKeys.list(),
    queryFn: listQuests
  })
}
