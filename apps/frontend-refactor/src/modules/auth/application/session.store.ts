import { create } from 'zustand'
import { isApiError } from '@/shared/api/api-error'
import { setUnauthorizedHandler } from '@/shared/api/http-client'
import { clearToken, getToken, setToken } from '@/shared/storage/token-storage'
import { logout as logoutRequest, refreshSession } from '../infrastructure/auth.requests'

// Access tokens live ~15m server-side; refresh well before that so requests
// never see a 401 mid-session.
const SILENT_REFRESH_INTERVAL_MS = 10 * 60 * 1000

interface SessionState {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  bootstrap: () => Promise<void>
  signIn: (token: string) => Promise<void>
  signOut: () => Promise<void>
}

let refreshTimer: ReturnType<typeof setInterval> | null = null

export const useSessionStore = create<SessionState>((set) => {
  function stopSilentRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  function scheduleSilentRefresh() {
    stopSilentRefresh()
    refreshTimer = setInterval(async () => {
      try {
        const { access_token } = await refreshSession()
        await setToken(access_token)
        set({ token: access_token, isAuthenticated: true })
      } catch (error) {
        if (isApiError(error) && error.status === 401) {
          stopSilentRefresh()
          await clearToken()
          set({ token: null, isAuthenticated: false })
        }
        // Network hiccup: keep the current token and let the next tick retry.
      }
    }, SILENT_REFRESH_INTERVAL_MS)
  }

  return {
    token: null,
    isAuthenticated: false,
    isLoading: true,
    async bootstrap() {
      try {
        const { access_token } = await refreshSession()
        await setToken(access_token)
        set({ token: access_token, isAuthenticated: true })
        scheduleSilentRefresh()
      } catch {
        // Refresh failed for any reason (cookie missing/expired, network hiccup, backend
        // unreachable, …) — fall back to the last known access token instead of forcing a
        // logout on every app restart. The token's own validity is verified lazily by
        // normal API calls; the http-client's 401 handler (see setUnauthorizedHandler) is
        // the single source of truth for "actually logged out."
        const stored = await getToken()
        set({ token: stored, isAuthenticated: stored !== null })
        if (stored) scheduleSilentRefresh()
      } finally {
        set({ isLoading: false })
      }
    },
    async signIn(token) {
      await setToken(token)
      set({ token, isAuthenticated: true })
      scheduleSilentRefresh()
    },
    async signOut() {
      stopSilentRefresh()
      try {
        await logoutRequest()
      } catch {
        // Best-effort: still clear local state if the network call fails.
      }
      await clearToken()
      set({ token: null, isAuthenticated: false })
    },
  }
})

// When the HTTP client exhausts its refresh attempt, drop the session.
setUnauthorizedHandler(() => {
  void useSessionStore.getState().signOut()
})
