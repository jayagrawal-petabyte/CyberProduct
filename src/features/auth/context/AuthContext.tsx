/**
 * BrainMint AuthProvider Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Implements authentication state container integrated with the backend API:
 * - Follows zero fake authentication / no hardcoded credentials guidelines
 * - Maintains real backend authentication via /api/v1/auth/login, /me, /logout
 * - Securely persists and restores sessions across page reloads
 * - Verifies token validity on mount and handles expired sessions
 * - Maps authenticated user profiles to Employee, Lead, and Security Administrator
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { AuthUser, LoginCredentials } from '../types/auth.types';
import {
  AuthContext,
  type AuthContextValue,
  type AuthProviderProps,
} from './authContextDef';
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser as apiGetCurrentUser,
  getStoredAccessToken,
  getStoredUser,
  saveAuthSession,
  clearAuthSession,
  mapBackendRole,
} from '../../../services/api/auth';

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialUser = null,
  backendReady,
}) => {
  // Real backend auth enforcement is active by default unless explicitly disabled
  const isBackendReady = backendReady ?? (import.meta.env.VITE_AUTH_READY !== 'false');

  const [user, setUserState] = useState<AuthUser | null>(() => {
    if (initialUser) return initialUser;
    return getStoredUser<AuthUser>();
  });

  // Track initial token validation on application mount
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // If a token exists in storage, start in loading state until verified
    return Boolean(getStoredAccessToken());
  });

  // Verify and refresh session on application mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const token = getStoredAccessToken();
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const result = await apiGetCurrentUser(token);
        if (isMounted && result?.user) {
          const mappedUser: AuthUser = {
            id: result.user.id,
            name: result.user.full_name || result.user.email,
            email: result.user.email,
            role: mapBackendRole(result.user.role),
            companyId: result.user.company_id,
            departmentId: result.user.department_id,
            jobTitle: result.user.job_title,
            status: result.user.status,
          };
          setUserState(mappedUser);
        }
      } catch {
        // Session expired or invalid: clear stored credentials
        if (isMounted) {
          clearAuthSession();
          setUserState(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const setUser = useCallback((newUser: AuthUser | null) => {
    setUserState(newUser);
    if (!newUser) {
      clearAuthSession();
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      setIsLoading(true);
      try {
        const result = await apiLogin({
          email: credentials.emailOrUsername,
          password: credentials.password,
          rememberMe: credentials.rememberMe,
        });

        const mappedUser: AuthUser = {
          id: result.user.id,
          name: result.user.full_name || result.user.email,
          email: result.user.email,
          role: mapBackendRole(result.user.role),
          companyId: result.user.company_id,
          departmentId: result.user.department_id,
          jobTitle: result.user.job_title,
          status: result.user.status,
        };

        saveAuthSession(
          result.session,
          mappedUser,
          result.company,
          credentials.rememberMe
        );

        setUserState(mappedUser);
        return mappedUser;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiLogout();
    } finally {
      clearAuthSession();
      setUserState(null);
      setIsLoading(false);
    }
  }, []);

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
