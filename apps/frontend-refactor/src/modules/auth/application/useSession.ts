import { useShallow } from 'zustand/react/shallow'
import { useSessionStore } from './session.store'

/** Read-friendly view of the session for components. */
export function useSession() {
  return useSessionStore(
    useShallow((state) => ({
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      signOut: state.signOut,
    })),
  )
}
