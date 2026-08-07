import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import { startQuestInstance } from '../infrastructure/quest.requests'
import { questKeys } from './quest.keys'

export function useStartQuest() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { error: notifyError } = useNotify()

  return useMutation({
    mutationFn: (instanceId: string) => startQuestInstance(instanceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: questKeys.all }),
    onError: (error) => notifyError(t('quest.detail.startErrorTitle'), getErrorMessage(error)),
  })
}
