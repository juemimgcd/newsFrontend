import type { AdminSession, AuthSession } from "../types";

type SessionKind = "user" | "admin";
type SessionValue = AuthSession | AdminSession;

const STORAGE_KEYS: Record<SessionKind, string> = {
  user: "news_front2.user.session",
  admin: "news_front2.admin.session",
};

function safeRead<T extends SessionValue>(storage: Storage | null, key: string): T | null {
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function getStoredSession<T extends SessionValue>(kind: SessionKind): T | null {
  const key = STORAGE_KEYS[kind];
  return safeRead<T>(window.sessionStorage, key) ?? safeRead<T>(window.localStorage, key);
}

export function saveStoredSession(kind: SessionKind, session: SessionValue, remember: boolean) {
  const key = STORAGE_KEYS[kind];
  clearStoredSession(kind);
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(key, JSON.stringify(session));
}

export function clearStoredSession(kind: SessionKind) {
  const key = STORAGE_KEYS[kind];
  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

export function getStorageMode(kind: SessionKind) {
  const key = STORAGE_KEYS[kind];

  if (window.localStorage.getItem(key)) {
    return "localStorage";
  }

  if (window.sessionStorage.getItem(key)) {
    return "sessionStorage";
  }

  return null;
}
