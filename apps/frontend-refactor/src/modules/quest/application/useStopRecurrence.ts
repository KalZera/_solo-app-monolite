import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import { updateQuestRecurrence } from '../infrastructure/quest.requests'
import { questKeys } from './quest.keys'

/**
 * Stops a recurring quest by setting its template's recurrence to CANCELLED, so the System no longer
 * materialises new instances. Existing instances are untouched. Takes the TEMPLATE id (quest.id).
 */
export function useStopRecurrence() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { success, error: notifyError } = useNotify()

  return useMutation({
    mutationFn: (questId: string) => updateQuestRecurrence(questId, 'CANCELLED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questKeys.all })
      success(
        t('quest.detail.stopRecurrenceSuccessTitle'),
        t('quest.detail.stopRecurrenceSuccessMessage'),
      )
    },
    onError: (error) =>
      notifyError(t('quest.detail.stopRecurrenceErrorTitle'), getErrorMessage(error)),
  })
}
