import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

// PUBLIC_INTERFACE
export default function AppShell() {
  /** Main authenticated application layout (sidebar + topbar). */
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const loc = useLocation();
  const nav = useNavigate();

  const titleMap = {
    "/": "Dashboard",
    "/clients": "Clients",
    "/projects": "Projects",
    "/settings": "Settings",
  };
  const pageTitle = titleMap[loc.pathname] || "Dashboard";

  const onLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true" />
          <div className="brand-title">
            <strong>Digital Agency</strong>
            <span>Client Management</span>
          </div>
        </div>

        <nav className="nav" aria-label="Primary navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
            <span className="left">
              <span aria-hidden="true">📊</span>
              <span>Dashboard</span>
            </span>
            <span className="badge">Home</span>
          </NavLink>

          <NavLink to="/clients" className={({ isActive }) => (isActive ? "active" : undefined)}>
            <span className="left">
              <span aria-hidden="true">👥</span>
              <span>Clients</span>
            </span>
          </NavLink>

          <NavLink to="/projects" className={({ isActive }) => (isActive ? "active" : undefined)}>
            <span className="left">
              <span aria-hidden="true">🗂️</span>
              <span>Projects</span>
            </span>
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : undefined)}>
            <span className="left">
              <span aria-hidden="true">⚙️</span>
              <span>Settings</span>
            </span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="pill" title="Signed-in user">
            {user?.email || "—"}
          </div>
          <button className="btn btn-sm" type="button" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
          </button>
          <button className="btn btn-sm btn-danger" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main>
        <div className="topbar">
          <div className="topbar-inner">
            <div>
              <h1 className="page-title">{pageTitle}</h1>
              <p className="page-sub">Manage your agency workflow with clients, projects, analytics, and exports.</p>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="pill">{theme === "light" ? "Light" : "Dark"} theme</span>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => toggleTheme()}>
                Toggle
              </button>
            </div>
          </div>
        </div>

        <div className="page content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
