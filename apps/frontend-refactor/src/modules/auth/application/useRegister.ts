import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import { register } from '../infrastructure/auth.requests'
import type { RegisterCredentials } from '../domain/auth.types'

export function useRegister() {
  const { t } = useTranslation()
  const router = useRouter()
  const { success, error: notifyError } = useNotify()

  return useMutation({
    mutationFn: (input: RegisterCredentials) => register(input),
    onSuccess: () => {
      success(t('auth.register.successTitle'), t('auth.register.successMessage'))
      router.replace('/login')
    },
    onError: (error) => notifyError(t('auth.register.errorTitle'), getErrorMessage(error)),
  })
}
