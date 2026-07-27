import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { createCharacter } from './character.requests'

export function useCreateCharacter() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppToast()

  return useMutation({
    mutationFn: createCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', 'profile'] })
      showSuccess('Hunter registered', 'Welcome to the System.')
    },
    onError: (error) => {
      showError('Registration failed', getErrorMessage(error))
    },
  })
}
