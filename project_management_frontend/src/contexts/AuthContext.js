import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { showToast } from "../components/Toast";

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides authentication state and actions. */
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const me = await api.me();
      setUser(me);
      return me;
    } catch (e) {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBootstrapping(true);
      const me = await refreshMe();
      if (!cancelled) {
        setUser(me);
        setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshMe]);

  const login = useCallback(async ({ email, password }) => {
    const resp = await api.login({ email, password });
    // backend returns { access_token }
    if (resp?.access_token) {
      const { setAccessToken } = await import("../api/client");
      setAccessToken(resp.access_token);
    }
    const me = await refreshMe();
    showToast({ type: "success", title: "Signed in", message: "Welcome back." });
    return me;
  }, [refreshMe]);

  const register = useCallback(async ({ email, password }) => {
    await api.register({ email, password });
    showToast({ type: "success", title: "Account created", message: "You can now sign in." });
  }, []);

  const logout = useCallback(async () => {
    const { clearAccessToken } = await import("../api/client");
    clearAccessToken();
    setUser(null);
    showToast({ type: "success", title: "Signed out", message: "You have been logged out." });
  }, []);

  const value = useMemo(
    () => ({
      user,
      bootstrapping,
      isAuthenticated: !!user,
      refreshMe,
      login,
      register,
      logout,
    }),
    [user, bootstrapping, refreshMe, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook for accessing auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
