"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

export type SessionUser = { name: string };

const STORAGE_KEY = "av_user";
const listeners = new Set<() => void>();

function readUser(): SessionUser | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as SessionUser) : null;
  } catch {
    return null;
  }
}

function getServerSnapshot(): SessionUser | null {
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writeUser(user: SessionUser | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
}

type SessionContextValue = {
  user: SessionUser | null;
  login: (name: string) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, readUser, getServerSnapshot);

  const login = (name: string) => writeUser({ name });
  const signOut = () => writeUser(null);

  return (
    <SessionContext.Provider value={{ user, login, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
