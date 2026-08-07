import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import { login } from '../infrastructure/auth.requests'
import type { LoginCredentials } from '../domain/auth.types'
import { useSessionStore } from './session.store'

export function useLogin() {
  const { t } = useTranslation()
  const { error: notifyError } = useNotify()
  const signIn = useSessionStore((state) => state.signIn)

  return useMutation({
    mutationFn: (input: LoginCredentials) => login(input),
    // Routing reacts to `isAuthenticated`, so signing in is all that's needed.
    onSuccess: (tokens) => signIn(tokens.access_token),
    onError: (error) => notifyError(t('auth.login.errorTitle'), getErrorMessage(error)),
  })
}
