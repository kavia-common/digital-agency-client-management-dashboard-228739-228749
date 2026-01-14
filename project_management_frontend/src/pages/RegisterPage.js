import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import { validateEmail, validatePassword } from "../utils/validation";

// PUBLIC_INTERFACE
export default function RegisterPage() {
  /** Register screen. */
  const { register } = useAuth();
  const nav = useNavigate();

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
      await register({ email: email.trim(), password });
      nav("/login", { replace: true });
    } catch (err) {
      showToast({
        type: "error",
        title: "Registration failed",
        message: err.message || "Please try a different email.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-hero">
          <h1>Create your workspace</h1>
          <p>
            Your account is used to scope clients, projects, analytics, and settings. You can switch theme anytime from
            Settings.
          </p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <h2>Create account</h2>
          <p className="sub">Register with an email and password (min 6 chars).</p>

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
              {submitting ? "Creating…" : "Create account"}
            </button>

            <div className="helper-row">
              <span>
                Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Sign in</Link>
              </span>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => showToast({ type: "info", title: "Tip", message: "After registering, sign in to load your dashboard." })}>
                Need help?
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
