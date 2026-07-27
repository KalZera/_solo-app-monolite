import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { completeQuest } from './quest.requests'

export function useCompleteQuest() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppToast()

  return useMutation({
    mutationFn: completeQuest,
    onSuccess: ({ quest }) => {
      queryClient.invalidateQueries({ queryKey: ['quests', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['quests', 'daily'] })
      queryClient.invalidateQueries({ queryKey: ['quests', 'detail', quest.id] })
      queryClient.invalidateQueries({ queryKey: ['character', 'profile'] })
      showSuccess('Quest completed', `+${quest.rewardXp} XP`)
    },
    onError: (error) => {
      showError('Failed to complete quest', getErrorMessage(error))
    },
  })
}
