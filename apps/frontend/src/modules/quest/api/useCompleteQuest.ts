import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { completeQuest } from './quest.requests'

export function useCompleteQuest() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppToast()

  return useMutation({
    mutationFn: completeQuest,
    onSuccess: ({ quest }) => {
      queryClient.invalidateQueries({ queryKey: ['quests', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['quests', 'daily'] })
      queryClient.invalidateQueries({ queryKey: ['quests', 'detail', quest.id] })
      queryClient.invalidateQueries({ queryKey: ['character', 'profile'] })
      showSuccess(t('quest.detail.toastSuccessTitle'), `+${quest.rewardXp} XP`)
    },
    onError: (error) => {
      showError(t('quest.detail.toastErrorTitle'), getErrorMessage(error))
    },
  })
}
