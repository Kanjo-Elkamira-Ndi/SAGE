/**
 * Session state for the admin console.
 *
 * Access token lives in memory only (docs/security.md) — a page reload
 * therefore clears the session, so this provider validates any cached token on
 * mount, and otherwise starts unauthenticated. The session-expired handler
 * plugs into apiClient so a refresh failure or `AUTH_TOKEN_REUSED` wipes the
 * session and lets `RequireAdmin` bounce the user to /login.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import {
  getAccessToken,
  getMe,
  login as apiLogin,
  logout as apiLogout,
  setSessionExpiredHandler,
} from "@/lib/apiClient";
import type { AuthUserPayload } from "@/lib/apiClient";

interface AuthContextValue {
  user: AuthUserPayload | null;
  initializing: boolean;
  sessionMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSessionMessage: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserPayload | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    let cancelled = false;
    getMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSessionExpiredHandler((reason) => {
      setUser(null);
      if (reason === "token-reused") {
        setSessionMessage(
          "You were signed out because your session was used from another location.",
        );
      } else if (reason === "refresh-failed") {
        setSessionMessage("Your session expired. Please log in again.");
      }
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      sessionMessage,
      login,
      logout,
      clearSessionMessage: () => setSessionMessage(null),
    }),
    [user, initializing, sessionMessage, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/** Route guard for /admin: must be signed in AND an admin. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg">
        <div className="flex items-center gap-3 rounded-lg border border-admin-outline bg-white px-5 py-4">
          <span className="h-2 w-2 animate-ping rounded-full bg-admin-royal" />
          <p className="text-sm font-medium text-admin-text-muted">
            Checking session…
          </p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/admin/403" replace />;
  return <>{children}</>;
}
