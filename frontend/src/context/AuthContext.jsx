import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

import { api, formatApiErrorDetail } from "@/lib/api";
import { disconnectSocket } from "@/lib/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // null = checking
  // false = logged out
  // object = authenticated user
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Prevent an authentication request from restoring the session
  // after logout has already started.
  const logoutInProgress = useRef(false);

  // Used to invalidate older /auth/me requests.
  const authRequestId = useRef(0);

  const refresh = useCallback(async () => {
    // IMPORTANT:
    // Never allow an auth check to restore the user while logout
    // is in progress.
    if (logoutInProgress.current) {
      return;
    }

    const requestId = ++authRequestId.current;

    try {
      const { data } = await api.get("/auth/me");

      // If logout happened while this request was running,
      // ignore this response.
      if (logoutInProgress.current) {
        return;
      }

      // Ignore an old authentication response.
      if (requestId !== authRequestId.current) {
        return;
      }

      setUser(data);
    } catch (err) {
      // Do not log normal 401 responses as errors.
      if (err?.response?.status !== 401) {
        console.warn("auth/me failed:", err.message);
      }

      // Do not overwrite the logged-out state after logout.
      if (!logoutInProgress.current) {
        setUser(false);
      }
    } finally {
      if (!logoutInProgress.current) {
        setInitialized(true);
      }
    }
  }, []);

  // Check authentication once when AuthProvider starts.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    // A new login cancels the logout state.
    logoutInProgress.current = false;

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      setUser(data.user);
      setInitialized(true);

      return {
        ok: true,
        user: data.user,
      };
    } catch (e) {
      return {
        ok: false,
        error:
          formatApiErrorDetail(e.response?.data?.detail) ||
          e.message,
      };
    }
  }, []);

  const register = useCallback(async (payload) => {
    // A new registration/login cancels the logout state.
    logoutInProgress.current = false;

    try {
      const { data } = await api.post("/auth/register", payload);

      setUser(data.user);
      setInitialized(true);

      return {
        ok: true,
        user: data.user,
      };
    } catch (e) {
      return {
        ok: false,
        error:
          formatApiErrorDetail(e.response?.data?.detail) ||
          e.message,
      };
    }
  }, []);

  const logout = useCallback(async () => {
    // IMPORTANT:
    // Set this BEFORE making the backend request.
    logoutInProgress.current = true;

    // Invalidate all older auth requests.
    authRequestId.current += 1;

    // Immediately remove the authenticated user from React state.
    setUser(false);
    setInitialized(true);

    // Disconnect realtime connection immediately.
    disconnectSocket();

    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("logout request failed:", err.message);
    } finally {
      // Keep the application logged out regardless of the
      // backend response.
      setUser(false);
      setInitialized(true);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      initialized,
      login,
      register,
      logout,
      refresh,
      setUser,
    }),
    [
      user,
      initialized,
      login,
      register,
      logout,
      refresh,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);