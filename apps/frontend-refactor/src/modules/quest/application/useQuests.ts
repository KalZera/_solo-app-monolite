import { useInfiniteQuery } from '@tanstack/react-query'
import { listQuests } from '../infrastructure/quest.requests'
import { questKeys } from './quest.keys'

const PAGE_SIZE = 10

/** Paginated quest list (infinite scroll). Flatten `data.pages` for rendering. */
export function useQuests() {
  return useInfiniteQuery({
    queryKey: questKeys.list(),
    queryFn: ({ pageParam }) => listQuests({ page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize
      return loaded < lastPage.total ? lastPage.page + 1 : undefined
    },
  })
}
