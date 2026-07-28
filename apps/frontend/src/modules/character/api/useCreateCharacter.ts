import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { createCharacter } from './character.requests'

export function useCreateCharacter() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppToast()

  return useMutation({
    mutationFn: createCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', 'profile'] })
      showSuccess(t('character.createForm.toastSuccessTitle'), t('character.createForm.toastSuccessMessage'))
    },
    onError: (error) => {
      showError(t('character.createForm.toastErrorTitle'), getErrorMessage(error))
    },
  })
}
