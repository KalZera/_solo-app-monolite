import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTutorialStatus } from '../infrastructure/auth.requests'
import { authKeys } from './auth.keys'

/**
 * Persists whether the Hunter has seen the tutorial. Defaults to marking it complete; pass
 * `false` to reset (so it auto-opens again). Updates the cached `me` so the gate reacts at once.
 */
export function useCompleteTutorial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isCompleteTutorial: boolean = true) => updateTutorialStatus(isCompleteTutorial),
    onSuccess: (me) => {
      queryClient.setQueryData(authKeys.me(), me)
    },
  })
}
