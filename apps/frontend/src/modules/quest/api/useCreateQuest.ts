import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { createQuest } from './quest.requests'

export function useCreateQuest() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppToast()

  return useMutation({
    mutationFn: createQuest,
    onSuccess: (quest) => {
      queryClient.invalidateQueries({ queryKey: ['quests', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['quests', 'daily'] })
      showSuccess(t('quest.create.toastSuccessTitle'), quest.title)
    },
    onError: (error) => {
      showError(t('quest.create.toastErrorTitle'), getErrorMessage(error))
    },
  })
}
