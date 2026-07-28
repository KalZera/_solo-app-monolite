import { useInfiniteQuery } from '@tanstack/react-query'
import { getCharacterHistory } from './character.requests'

export const CHARACTER_HISTORY_PAGE_SIZE = 10

export function useCharacterHistory(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['character', 'history'],
    queryFn: ({ pageParam }) => getCharacterHistory({ page: pageParam, pageSize: CHARACTER_HISTORY_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize
      return loaded < lastPage.total ? lastPage.page + 1 : undefined
    },
    enabled,
  })
}
