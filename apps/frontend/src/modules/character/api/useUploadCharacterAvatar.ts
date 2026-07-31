import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { uploadCharacterAvatar } from './character.requests'

export function useUploadCharacterAvatar() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppToast()

  return useMutation({
    mutationFn: uploadCharacterAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', 'profile'] })
      showSuccess(t('character.avatarEditor.toastSuccessTitle'), t('character.avatarEditor.toastSuccessMessage'))
    },
    onError: (error) => {
      showError(t('character.avatarEditor.toastErrorTitle'), getErrorMessage(error))
    },
  })
}
