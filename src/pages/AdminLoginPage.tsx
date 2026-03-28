import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAdmin } from "../lib/api";
import type { AdminSession } from "../types";

interface AdminLoginPageProps {
  session: AdminSession | null;
  onAuthSuccess: (session: AdminSession, remember: boolean) => void;
}

export function AdminLoginPage({ session, onAuthSuccess }: AdminLoginPageProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username.trim().length < 2) {
      setError("Admin username must be at least 2 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Admin password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const nextSession = await loginAdmin(username.trim(), password);
      onAuthSuccess(nextSession, remember);
      navigate("/admin/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card">
        <div className="admin-auth-card__intro">
          <p className="eyebrow">Operations desk</p>
          <h1>Admin review room</h1>
          <p>
            Monitor users, inspect the news corpus, and surface operational signals from the same
            backend.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Username</span>
            <div className="input-shell input-shell--dark">
              <input value={username} onChange={(event) => setUsername(event.target.value)} />
            </div>
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <div className="input-shell input-shell--dark">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </label>

          <label className="checkbox-row checkbox-row--dark">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Remember this admin session</span>
          </label>

          {error ? <div className="form-feedback form-feedback--dark">{error}</div> : null}

          <button type="submit" className="primary-button primary-button--gold" disabled={submitting}>
            {submitting ? "Signing in..." : "Enter admin desk"}
          </button>
        </form>

        <div className="admin-auth-card__footer">
          <Link className="ghost-button ghost-button--outlined ghost-button--dark" to="/">
            Back to user login
          </Link>
        </div>
      </section>
    </main>
  );
}
