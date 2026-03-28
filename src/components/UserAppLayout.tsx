import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { ApiError, getCategories, getUserInfo } from "../lib/api";
import { formatCompactNumber } from "../lib/format";
import type { AuthSession, Category, UserInfo } from "../types";

export interface UserLayoutContext {
  session: AuthSession;
  profile: UserInfo;
  categories: Category[];
  loadingBootstrap: boolean;
  bootstrapError: string;
  updateProfile: (profile: UserInfo) => void;
  refreshBootstrap: () => Promise<void>;
  signOut: () => void;
}

interface UserAppLayoutProps {
  session: AuthSession | null;
  onSessionChange: (session: AuthSession) => void;
  onSignOut: () => void;
}

const navigationItems = [
  { to: "/app/home", label: "Home" },
  { to: "/app/favorites", label: "Favorites" },
  { to: "/app/history", label: "History" },
  { to: "/app/profile", label: "Profile" },
];

export function UserAppLayout({ session, onSessionChange, onSignOut }: UserAppLayoutProps) {
  const location = useLocation();
  const [profile, setProfile] = useState<UserInfo | null>(session?.userInfo ?? null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingBootstrap, setLoadingBootstrap] = useState(true);
  const [bootstrapError, setBootstrapError] = useState("");

  useEffect(() => {
    if (session?.userInfo) {
      setProfile(session.userInfo);
    }
  }, [session]);

  async function refreshBootstrap() {
    if (!session) {
      return;
    }

    setLoadingBootstrap(true);
    setBootstrapError("");

    try {
      const [nextProfile, nextCategories] = await Promise.all([
        getUserInfo(session.token),
        getCategories(),
      ]);

      setProfile(nextProfile);
      setCategories(nextCategories);
      onSessionChange({
        ...session,
        userInfo: nextProfile,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onSignOut();
        return;
      }

      setBootstrapError(error instanceof Error ? error.message : "Unable to load the workspace.");
    } finally {
      setLoadingBootstrap(false);
    }
  }

  useEffect(() => {
    void refreshBootstrap();
  }, [session?.token]);

  const contextValue = useMemo<UserLayoutContext | null>(() => {
    if (!session || !profile) {
      return null;
    }

    return {
      session,
      profile,
      categories,
      loadingBootstrap,
      bootstrapError,
      updateProfile: (nextProfile) => {
        setProfile(nextProfile);
        onSessionChange({
          ...session,
          userInfo: nextProfile,
        });
      },
      refreshBootstrap,
      signOut: onSignOut,
    };
  }, [bootstrapError, categories, loadingBootstrap, onSignOut, profile, session]);

  if (!session || !profile || !contextValue) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <div className="app-sidebar__top">
          <Link to="/app/home" className="app-brand">
            <span className="brand-kicker">Review Ledger</span>
            <strong>User edition</strong>
          </Link>
          <p>
            A warm editorial shell for the full reader journey: discovery, detail, memory, and
            profile.
          </p>
        </div>

        <div className="sidebar-profile">
          <img
            src={profile.avatar || "https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"}
            alt={profile.username}
          />
          <div>
            <strong>{profile.nickname || profile.username}</strong>
            <span>@{profile.username}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-stat">
          <span className="capsule">Categories</span>
          <strong>{formatCompactNumber(categories.length)}</strong>
          <p>Public news sections loaded into the frontend.</p>
        </div>

        <div className="sidebar-footer">
          <Link className="ghost-button ghost-button--outlined" to="/admin">
            Open admin desk
          </Link>
          <button type="button" className="ghost-button ghost-button--outlined" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <div>
            <p className="eyebrow">Reader workspace</p>
            <h1>{navigationItems.find((item) => location.pathname.startsWith(item.to))?.label || "Workspace"}</h1>
          </div>
          <div className="app-topbar__status">
            <span className="capsule">{loadingBootstrap ? "Refreshing" : "Session live"}</span>
            {bootstrapError ? <span className="status-error">{bootstrapError}</span> : null}
          </div>
        </header>

        <Outlet context={contextValue} />
      </main>
    </div>
  );
}
