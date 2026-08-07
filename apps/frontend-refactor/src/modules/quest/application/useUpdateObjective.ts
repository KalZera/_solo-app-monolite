import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import {
  updateQuestObjective,
  type UpdateQuestObjectiveInput,
} from '../infrastructure/quest.requests'
import { questKeys } from './quest.keys'

export function useUpdateObjective() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { error: notifyError } = useNotify()

  return useMutation({
    mutationFn: (input: UpdateQuestObjectiveInput) => updateQuestObjective(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: questKeys.today() }),
    onError: (error) => notifyError(t('quest.detail.objectiveErrorTitle'), getErrorMessage(error)),
  })
}
