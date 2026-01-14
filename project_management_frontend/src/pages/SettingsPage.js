import React from "react";
import { getApiBaseUrl } from "../api/client";
import { useTheme } from "../contexts/ThemeContext";
import { showToast } from "../components/Toast";

// PUBLIC_INTERFACE
export default function SettingsPage() {
  /** Settings screen: dark/light mode persisted via backend user settings. */
  const { theme, setTheme, loadingSettings, reloadSettings } = useTheme();

  const onSet = async (t) => {
    await setTheme(t);
  };

  return (
    <div className="grid" style={{ gap: 16, maxWidth: 900 }}>
      <div className="card">
        <h3>Appearance</h3>
        <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Theme</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
              Persisted per user via backend settings.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="pill">{loadingSettings ? "Loading…" : `Current: ${theme}`}</span>
            <button className="btn btn-sm" type="button" onClick={() => onSet("light")} disabled={loadingSettings}>
              Light
            </button>
            <button className="btn btn-sm" type="button" onClick={() => onSet("dark")} disabled={loadingSettings}>
              Dark
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Backend</h3>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>API Base URL</div>
              <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>{getApiBaseUrl()}</div>
            </div>
            <button
              className="btn btn-sm"
              type="button"
              onClick={() => {
                showToast({
                  type: "success",
                  title: "Configured",
                  message: "API URL is read from REACT_APP_API_BASE_URL.",
                });
              }}
            >
              Test toast
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-sm" type="button" onClick={reloadSettings}>
              Reload settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
