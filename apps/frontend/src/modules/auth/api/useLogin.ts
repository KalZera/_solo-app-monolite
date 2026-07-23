import { useMutation } from '@tanstack/react-query'
import { useSession } from '../session/SessionProvider'
import { login } from './auth.requests'

export function useLogin() {
  const { signIn } = useSession()

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      await signIn(data.access_token)
    },
  })
}
