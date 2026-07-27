import { useMutation } from '@tanstack/react-query'
import { useSession } from '../session/SessionProvider'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { login } from './auth.requests'

export function useLogin() {
  const { signIn } = useSession()
  const { showError } = useAppToast()

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      await signIn(data.access_token)
    },
    onError: (error) => {
      showError('Authentication failed', getErrorMessage(error))
    },
  })
}
