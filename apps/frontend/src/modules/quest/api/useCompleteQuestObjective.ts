import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { completeQuestObjective } from './quest.requests'

export function useCompleteQuestObjective() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { showError } = useAppToast()

  return useMutation({
    mutationFn: completeQuestObjective,
    onSuccess: ({ quest }) => {
      queryClient.invalidateQueries({ queryKey: ['quests', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['quests', 'detail', quest.id] })
    },
    onError: (error) => {
      showError(t('quest.detail.objectiveCompleteErrorTitle'), getErrorMessage(error))
    },
  })
}
