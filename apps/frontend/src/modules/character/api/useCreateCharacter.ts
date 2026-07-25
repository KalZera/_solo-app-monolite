import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCharacter } from './character.requests'

export function useCreateCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', 'profile'] })
    },
  })
}
