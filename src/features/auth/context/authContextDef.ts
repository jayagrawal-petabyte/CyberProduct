/**
 * BrainMint AuthContext Definition & Types
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import { createContext } from 'react';
import type { AuthUser, LoginCredentials, UserRole } from '../types/auth.types';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBackendReady: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AUTH_STORAGE_KEY = 'cyberproduct_auth_user';

export interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
  /**
   * If true, real authentication backend enforcement is active.
   * When false (default), authentication backend is not ready, so unauthenticated
   * users are not blocked from inspecting existing teammate dashboard routes.
   */
  backendReady?: boolean;
}

export type { UserRole };
