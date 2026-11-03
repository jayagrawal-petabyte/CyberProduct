/**
 * BrainMint AuthProvider Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Implements an isolated, extensible authentication state container:
 * - Follows zero fake authentication / no hardcoded credentials guidelines
 * - Maintains clean isolation for backend API integration
 * - Supports role state when user authorization info is present
 * - Exposes isBackendReady flag to manage transition to production auth
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { AuthUser, LoginCredentials } from '../types/auth.types';
import {
  AuthContext,
  AUTH_STORAGE_KEY,
  type AuthContextValue,
  type AuthProviderProps,
} from './authContextDef';

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialUser = null,
  backendReady,
}) => {
  // Default to env variable if present, otherwise false (backend auth not ready)
  const isBackendReady = backendReady ?? (import.meta.env.VITE_AUTH_READY === 'true');

  const [user, setUserState] = useState<AuthUser | null>(() => {
    if (initialUser) return initialUser;
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AuthUser;
      }
    } catch {
      // In restricted storage environments, fallback to null
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  const setUser = useCallback((newUser: AuthUser | null) => {
    setUserState(newUser);
    try {
      if (newUser) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors in sandbox
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        /**
         * ──────────────────────────────────────────────────────────────────────────
         * BACKEND INTEGRATION PLACEHOLDER
         * ──────────────────────────────────────────────────────────────────────────
         * When the real backend authentication service is deployed, invoke:
         *   const response = await authApi.login(credentials);
         *   setUser(response.user);
         */
        void credentials;
        await new Promise((resolve) => setTimeout(resolve, 600));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isBackendReady,
      login,
      logout,
      setUser,
    }),
    [user, isLoading, isBackendReady, login, logout, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
