/*
 * Carbon & Crimson IMS
 * File: src/state/auth_context.jsx
 * Version: 1.1.0
 * Purpose: Auth state (token + user) with persistence (remember me supported).
 * Notes:
 * - Reads from localStorage (remember) or sessionStorage (non-remember).
 * - Writes to one storage at a time to avoid stale sessions.
 */

import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'cc_ims_auth_v1';

function safeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
}

function readCachedAuth() {
  const local = safeParse(localStorage.getItem(STORAGE_KEY) || '');
  if (local?.token) return { source: 'local', data: local };

  const session = safeParse(sessionStorage.getItem(STORAGE_KEY) || '');
  if (session?.token) return { source: 'session', data: session };

  return { source: null, data: null };
}

function clearAll() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const cached = readCachedAuth().data;
  const [token, setToken] = useState(cached?.token || null);
  const [user, setUser] = useState(cached?.user || null);

  const value = useMemo(() => ({
    token,
    user,

    /**
     * Persist auth payload.
     * @param {object|null} next expected shape: { token, user }
     * @param {object} options
     * @param {boolean} options.remember store in localStorage when true, sessionStorage when false
     */
    setAuth: (next, options = { remember: true }) => {
      const remember = options?.remember !== false;

      setToken(next?.token || null);
      setUser(next?.user || null);

      clearAll();

      if (next?.token) {
        const payload = JSON.stringify(next);
        if (remember) {
          localStorage.setItem(STORAGE_KEY, payload);
        } else {
          sessionStorage.setItem(STORAGE_KEY, payload);
        }
      }
    },

    logout: () => {
      setToken(null);
      setUser(null);
      clearAll();
    }
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
