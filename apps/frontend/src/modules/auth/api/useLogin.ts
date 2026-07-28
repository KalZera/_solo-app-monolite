import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSession } from '../session/SessionProvider'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { login } from './auth.requests'

export function useLogin() {
  const { t } = useTranslation()
  const { signIn } = useSession()
  const { showError } = useAppToast()

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      await signIn(data.access_token)
    },
    onError: (error) => {
      showError(t('auth.login.toastErrorTitle'), getErrorMessage(error))
    },
  })
}
