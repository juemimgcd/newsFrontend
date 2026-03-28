import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { clearStoredSession, getStorageMode, getStoredSession, saveStoredSession } from "./lib/auth";
import { UserAppLayout } from "./components/UserAppLayout";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NewsDetailPage } from "./pages/NewsDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import type { AdminSession, AuthSession } from "./types";

export default function App() {
  const [userSession, setUserSession] = useState<AuthSession | null>(() =>
    getStoredSession<AuthSession>("user"),
  );
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() =>
    getStoredSession<AdminSession>("admin"),
  );

  function handleUserAuthSuccess(nextSession: AuthSession, remember: boolean) {
    saveStoredSession("user", nextSession, remember);
    setUserSession(nextSession);
  }

  function handleAdminAuthSuccess(nextSession: AdminSession, remember: boolean) {
    saveStoredSession("admin", nextSession, remember);
    setAdminSession(nextSession);
  }

  function handleUserSessionChange(nextSession: AuthSession) {
    const remember = getStorageMode("user") !== "sessionStorage";
    saveStoredSession("user", nextSession, remember);
    setUserSession(nextSession);
  }

  function handleAdminSessionChange(nextSession: AdminSession) {
    const remember = getStorageMode("admin") !== "sessionStorage";
    saveStoredSession("admin", nextSession, remember);
    setAdminSession(nextSession);
  }

  function handleUserSignOut() {
    clearStoredSession("user");
    setUserSession(null);
  }

  function handleAdminSignOut() {
    clearStoredSession("admin");
    setAdminSession(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              session={userSession}
              onAuthSuccess={handleUserAuthSuccess}
              adminSession={adminSession}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminLoginPage session={adminSession} onAuthSuccess={handleAdminAuthSuccess} />
          }
        />
        <Route
          path="/app"
          element={
            <UserAppLayout
              session={userSession}
              onSessionChange={handleUserSessionChange}
              onSignOut={handleUserSignOut}
            />
          }
        >
          <Route index element={<Navigate to="/app/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="news/:newsId" element={<NewsDetailPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route
          path="/admin/dashboard"
          element={
            <AdminDashboardPage
              session={adminSession}
              onSessionChange={handleAdminSessionChange}
              onSignOut={handleAdminSignOut}
            />
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to={userSession ? "/app/home" : adminSession ? "/admin/dashboard" : "/"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
