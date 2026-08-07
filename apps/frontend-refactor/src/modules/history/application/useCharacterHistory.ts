import { useInfiniteQuery } from '@tanstack/react-query'
import { getCharacterHistory } from '../infrastructure/character-history.requests'

const PAGE_SIZE = 20

// Key sits under ['character'] so completing a quest (which invalidates the
// character) also refreshes the history feed.
export function useCharacterHistory() {
  return useInfiniteQuery({
    queryKey: ['character', 'history'],
    queryFn: ({ pageParam }) => getCharacterHistory({ page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize
      return loaded < lastPage.total ? lastPage.page + 1 : undefined
    },
    retry: false,
  })
}
