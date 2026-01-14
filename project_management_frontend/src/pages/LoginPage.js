import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../components/Toast";
import { validateEmail, validatePassword } from "../utils/validation";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login screen. */
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const e = validateEmail(email);
    const p = validatePassword(password);
    return { email: e, password: p };
  }, [email, password]);

  const canSubmit = !errors.email && !errors.password && !submitting;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      const redirectTo = loc.state?.from?.pathname || "/";
      nav(redirectTo, { replace: true });
    } catch (err) {
      showToast({ type: "error", title: "Sign in failed", message: err.message || "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-hero">
          <h1>Agency Dashboard</h1>
          <p>
            Manage clients and projects with a clean, modern workflow. Sign in to view analytics, create projects, and
            export your data.
          </p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <h2>Sign in</h2>
          <p className="sub">Use your email and password to access your workspace.</p>

          <div className="form-grid">
            <label className="label">
              Email
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@agency.com" />
              {errors.email ? <span className="error-text">{errors.email}</span> : null}
            </label>

            <label className="label">
              Password
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
              />
              {errors.password ? <span className="error-text">{errors.password}</span> : null}
            </label>

            <button className="btn btn-primary" type="submit" disabled={!canSubmit}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>

            <div className="helper-row">
              <span>
                No account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>Create one</Link>
              </span>
              <span className="pill">Backend: {process.env.REACT_APP_API_BASE_URL || "http://localhost:3001"}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
