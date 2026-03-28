import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginCharacterStage } from "../components/LoginCharacterStage";
import { loginUser, registerUser } from "../lib/api";
import type { AdminSession, AuthSession } from "../types";

type AuthMode = "signin" | "register";

interface LoginPageProps {
  session: AuthSession | null;
  adminSession: AdminSession | null;
  onAuthSuccess: (session: AuthSession, remember: boolean) => void;
}

interface IconProps {
  className?: string;
}

function SparklesIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3zm6 10l.8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13zM6 14l1 2.7L9.7 18 7 19l-1 2.7L5 19l-2.7-1L5 16.7 6 14z"
        fill="currentColor"
      />
    </svg>
  );
}

function EyeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.6 5.2A11.9 11.9 0 0 1 12 5c6.4 0 10 7 10 7a20.9 20.9 0 0 1-3 3.8M6.6 6.6C4 8.4 2 12 2 12a20.8 20.8 0 0 0 6.2 6.1M14.1 14.1A3 3 0 0 1 9.9 9.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function validate(mode: AuthMode, username: string, password: string, confirmPassword: string) {
  if (username.trim().length < 2 || username.trim().length > 8) {
    return "Username must be between 2 and 8 characters.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  if (mode === "register" && password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

export function LoginPage({ session, adminSession, onAuthSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      navigate("/app/home", { replace: true });
    }
  }, [navigate, session]);

  const heading = useMemo(() => {
    return mode === "signin" ? "Welcome back!" : "Create your account";
  }, [mode]);

  const subheading = useMemo(() => {
    return mode === "signin"
      ? "Please enter your details"
      : "Set a username and password to continue";
  }, [mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = validate(mode, username, password, confirmPassword);
    if (nextError) {
      setError(nextError);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const authSession =
        mode === "signin"
          ? await loginUser(username.trim(), password)
          : await registerUser(username.trim(), password);

      onAuthSuccess(authSession, remember);
      navigate("/app/home", { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to complete the request right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-screen__visual">
        <LoginCharacterStage
          isTyping={isTyping}
          password={password}
          showPassword={showPassword}
        />
      </section>

      <section className="login-screen__form-panel">
        <div className="login-form-shell">
          <div className="login-form-shell__mobile-brand">
            <div className="login-form-shell__mobile-brand-mark">
              <SparklesIcon className="login-form-shell__icon" />
            </div>
            <span>Review Ledger</span>
          </div>

          <div className="login-form-shell__header">
            <h1>{heading}</h1>
            <p>{subheading}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-field">
              <span>Username</span>
              <input
                type="text"
                placeholder="atlas"
                value={username}
                autoComplete="username"
                onChange={(event) => setUsername(event.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                maxLength={8}
                required
              />
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="login-password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="login-form-shell__icon" />
                  ) : (
                    <EyeIcon className="login-form-shell__icon" />
                  )}
                </button>
              </div>
            </label>

            {mode === "register" ? (
              <label className="login-field">
                <span>Confirm password</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
            ) : null}

            <div className="login-form__row">
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Remember for 30 days</span>
              </label>
              <button
                type="button"
                className="login-inline-link"
                onClick={() => setError("Password reset is not wired in this frontend yet.")}
              >
                Forgot password?
              </button>
            </div>

            {error ? <div className="login-error">{error}</div> : null}

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : mode === "signin" ? "Log in" : "Create account"}
            </button>
          </form>

          <div className="login-secondary-action">
            <Link
              to={adminSession ? "/admin/dashboard" : "/admin"}
              className="login-secondary-action__button"
            >
              <MailIcon className="login-form-shell__icon" />
              {adminSession ? "Open admin desk" : "Admin sign in"}
            </Link>
          </div>

          <div className="login-footer-copy">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="login-inline-link login-inline-link--strong"
              onClick={() => {
                setMode((current) => (current === "signin" ? "register" : "signin"));
                setError("");
              }}
            >
              {mode === "signin" ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
