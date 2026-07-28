import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { allocateAttributePoint } from './character.requests'

export function useAllocateAttributePoint() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { showError } = useAppToast()

  return useMutation({
    mutationFn: allocateAttributePoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', 'profile'] })
    },
    onError: (error) => {
      showError(t('character.allocateAttribute.toastErrorTitle'), getErrorMessage(error))
    },
  })
}
