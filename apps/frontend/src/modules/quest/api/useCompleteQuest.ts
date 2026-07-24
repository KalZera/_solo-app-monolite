import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeQuest } from './quest.requests'

export function useCompleteQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeQuest,
    onSuccess: (quest) => {
      queryClient.invalidateQueries({ queryKey: ['quests', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['quests', 'detail', quest.id] })
    },
  })
}
