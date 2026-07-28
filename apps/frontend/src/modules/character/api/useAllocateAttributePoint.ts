import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useAppToast } from '@/shared/notifications/useAppToast'
import { allocateAttributePoint } from './character.requests'

export function useAllocateAttributePoint() {
  const queryClient = useQueryClient()
  const { showError } = useAppToast()

  return useMutation({
    mutationFn: allocateAttributePoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', 'profile'] })
    },
    onError: (error) => {
      showError('Could not allocate point', getErrorMessage(error))
    },
  })
}
