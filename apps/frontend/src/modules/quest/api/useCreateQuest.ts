import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createQuest } from './quest.requests'

export function useCreateQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createQuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests', 'list'] })
    },
  })
}
