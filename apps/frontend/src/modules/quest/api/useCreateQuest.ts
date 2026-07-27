import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { createQuest } from './quest.requests'

export function useCreateQuest() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppToast()

  return useMutation({
    mutationFn: createQuest,
    onSuccess: (quest) => {
      queryClient.invalidateQueries({ queryKey: ['quests', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['quests', 'daily'] })
      showSuccess('Quest created', quest.title)
    },
    onError: (error) => {
      showError('Failed to create quest', getErrorMessage(error))
    },
  })
}
