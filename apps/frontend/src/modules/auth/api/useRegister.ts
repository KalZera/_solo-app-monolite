import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { register } from './auth.requests'

export function useRegister() {
  const { t } = useTranslation()
  const { showError } = useAppToast()

  return useMutation({
    mutationFn: register,
    onError: (error) => {
      showError(t('auth.register.toastErrorTitle'), getErrorMessage(error))
    },
  })
}
