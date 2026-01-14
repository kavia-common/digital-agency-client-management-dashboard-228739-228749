import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
export function ProtectedRoute() {
  /** Protects routes that require authentication. */
  const { isAuthenticated, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <div className="auth-shell">
        <div className="card" style={{ width: "min(560px, 100%)" }}>
          <h3>Loading</h3>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Checking your session…</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
