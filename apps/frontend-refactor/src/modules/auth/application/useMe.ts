import { useQuery } from '@tanstack/react-query'
import { getMe } from '../infrastructure/auth.requests'
import { useSession } from './useSession'
import { authKeys } from './auth.keys'

/** Loads the authenticated Hunter (id, email, username, tutorial flag). */
export function useMe() {
  const { isAuthenticated } = useSession()

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    enabled: isAuthenticated,
    retry: false,
  })
}
