import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { showToast } from "../components/Toast";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

// PUBLIC_INTERFACE
export function ThemeProvider({ children }) {
  /** Provides theme state and actions; persists to backend user settings when authenticated. */
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState("light");
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const loadSettings = useCallback(async () => {
    if (!isAuthenticated) {
      setLoadingSettings(false);
      return;
    }
    setLoadingSettings(true);
    try {
      const settings = await api.getSettings(); // { theme }
      if (settings?.theme) setTheme(settings.theme);
    } catch (e) {
      // Don't block; default theme remains.
    } finally {
      setLoadingSettings(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const setAndPersistTheme = useCallback(
    async (nextTheme) => {
      setTheme(nextTheme);
      if (!isAuthenticated) return;

      try {
        const updated = await api.updateSettings({ theme: nextTheme });
        if (updated?.theme) setTheme(updated.theme);
        showToast({ type: "success", title: "Settings saved", message: `Theme set to ${nextTheme}.` });
      } catch (e) {
        showToast({ type: "error", title: "Could not save theme", message: e.message || "Please try again." });
      }
    },
    [isAuthenticated]
  );

  const toggleTheme = useCallback(async () => {
    const next = theme === "light" ? "dark" : "light";
    await setAndPersistTheme(next);
  }, [theme, setAndPersistTheme]);

  const value = useMemo(
    () => ({
      theme,
      loadingSettings,
      setTheme: setAndPersistTheme,
      toggleTheme,
      reloadSettings: loadSettings,
    }),
    [theme, loadingSettings, setAndPersistTheme, toggleTheme, loadSettings]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// PUBLIC_INTERFACE
export function useTheme() {
  /** Hook for accessing theme context. */
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
