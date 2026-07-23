import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { clearToken, getToken, setToken } from '@/shared/storage/token-storage'

interface SessionContextValue {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (token: string) => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setSessionToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getToken().then((storedToken) => {
      if (!isMounted) return
      setSessionToken(storedToken)
      setIsLoading(false)
    })
    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      token,
      isAuthenticated: token !== null,
      isLoading,
      async signIn(newToken: string) {
        await setToken(newToken)
        setSessionToken(newToken)
      },
      async signOut() {
        await clearToken()
        setSessionToken(null)
      },
    }),
    [token, isLoading],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
