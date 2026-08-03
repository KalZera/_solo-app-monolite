import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { logout as logoutRequest, refreshSession } from "../api/auth.requests";
import { clearToken, getToken, setToken } from "@/shared/storage/token-storage";

// Access tokens live 15m server-side; refresh well before that so requests never see a 401.
const SILENT_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

interface SessionContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopSilentRefresh() {
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
      refreshTimer.current = null;
    }
  }

  function scheduleSilentRefresh() {
    stopSilentRefresh();
    refreshTimer.current = setInterval(async () => {
      try {
        const { access_token } = await refreshSession();
        await setToken(access_token);
        setSessionToken(access_token);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          stopSilentRefresh();
          await clearToken();
          setSessionToken(null);
        }
        // Network hiccup: keep the current token and let the next tick retry.
      }
    }, SILENT_REFRESH_INTERVAL_MS);
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const { access_token } = await refreshSession();
        if (!isMounted) return;
        await setToken(access_token);
        setSessionToken(access_token);
        scheduleSilentRefresh();
      } catch (error) {
        if (!isMounted) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          await clearToken();
          setSessionToken(null);
        } else {
          // Backend unreachable: fall back to the last known token instead of forcing a logout.
          const storedToken = await getToken();
          setSessionToken(storedToken);
          if (storedToken) scheduleSilentRefresh();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
      stopSilentRefresh();
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      token,
      isAuthenticated: token !== null,
      isLoading,
      async signIn(newToken: string) {
        await setToken(newToken);
        setSessionToken(newToken);
        scheduleSilentRefresh();
      },
      async signOut() {
        stopSilentRefresh();
        try {
          await logoutRequest();
        } catch {
          // best-effort: still clear local state even if the network call fails
        }
        await clearToken();
        setSessionToken(null);
      },
    }),
    [token, isLoading],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
