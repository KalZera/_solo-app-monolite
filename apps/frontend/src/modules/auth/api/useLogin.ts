import { useMutation } from '@tanstack/react-query'
import { setToken } from '@/shared/storage/token-storage'
import { login } from './auth.requests'

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      await setToken(data.access_token)
    },
  })
}
