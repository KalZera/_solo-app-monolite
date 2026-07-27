import { useMutation } from '@tanstack/react-query'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { register } from './auth.requests'

export function useRegister() {
  const { showError } = useAppToast()

  return useMutation({
    mutationFn: register,
    onError: (error) => {
      showError('Registration failed', getErrorMessage(error))
    },
  })
}
