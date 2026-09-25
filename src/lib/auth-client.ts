"use client";

import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
}

const AUTH_EVENT_NAME = "mecommerce:auth-state-change";

export function notifyAuthChange(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem("mecommerce_user_cache", JSON.stringify(user));
    } else {
      localStorage.removeItem("mecommerce_user_cache");
    }
  } catch {}
  window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: user }));
}

let activeMePromise: Promise<AuthUser | null> | null = null;

async function fetchMeOnce(): Promise<AuthUser | null> {
  if (activeMePromise) return activeMePromise;
  activeMePromise = (async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          try {
            localStorage.setItem("mecommerce_user_cache", JSON.stringify(data.user));
          } catch {}
          return data.user as AuthUser;
        }
      }
      try {
        localStorage.removeItem("mecommerce_user_cache");
      } catch {}
      return null;
    } catch {
      return null;
    } finally {
      activeMePromise = null;
    }
  })();
  return activeMePromise;
}

export function useAuthSession() {
  // Always initialize to null on initial render to guarantee 100% server/client HTML hydration match
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const userData = await fetchMeOnce();
      setUser(userData);
      return userData;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Safely hydrate from localStorage immediately after mount
    try {
      const cached = localStorage.getItem("mecommerce_user_cache");
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch {}

    refreshAuth();

    const handleAuthEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AuthUser | null>;
      setUser(customEvent.detail ?? null);
      setLoading(false);
    };

    window.addEventListener(AUTH_EVENT_NAME, handleAuthEvent);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthEvent);
    };
  }, [refreshAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    notifyAuthChange(null);
  }, []);

  return { user, loading, refreshAuth, logout };
}
