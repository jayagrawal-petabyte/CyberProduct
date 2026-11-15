/**
 * BrainMint Authentication API Service
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Implements real backend authentication integration:
 * - Communicates with backend endpoints (/api/v1/auth/login, /api/v1/auth/me, /api/v1/auth/logout)
 * - Manages JWT access and refresh tokens securely in storage
 * - Maps backend user profile and RBAC roles to frontend types
 * - Zero hardcoded credentials; zero exposure of Supabase service-role keys
 */

import type { UserRole } from '../../features/auth/types/auth.types';

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'cyberproduct_access_token',
  REFRESH_TOKEN: 'cyberproduct_refresh_token',
  USER: 'cyberproduct_auth_user',
  COMPANY: 'cyberproduct_auth_company',
  REMEMBER_ME: 'cyberproduct_remember_me',
} as const;

export interface BackendAuthUser {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
  company_id: string;
  department_id?: string | null;
  manager_id?: string | null;
  job_title?: string | null;
  status: string;
}

export interface BackendAuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
}

export interface BackendAuthCompany {
  id: string;
  name: string;
  slug: string;
  status: string;
  settings?: Record<string, unknown>;
  policy_version?: number;
}

export interface LoginResult {
  session: BackendAuthSession;
  user: BackendAuthUser;
  company: BackendAuthCompany;
}

export interface MeResult {
  user: BackendAuthUser;
  company: BackendAuthCompany;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Maps database/backend role strings to the frontend UserRole union.
 * - 'employee' -> 'employee'
 * - 'lead' -> 'lead'
 * - 'security_admin' -> 'security'
 * - 'admin' -> 'admin'
 */
export function mapBackendRole(role?: string): UserRole {
  if (!role) return 'employee';
  const normalized = role.toLowerCase().trim();
  switch (normalized) {
    case 'security_admin':
    case 'security':
      return 'security';
    case 'lead':
      return 'lead';
    case 'admin':
      return 'admin';
    case 'employee':
    default:
      return 'employee';
  }
}

/**
 * Resolves the full URL for an API endpoint.
 * In development on Vite, relative URLs leverage the Vite dev server proxy.
 * In production (e.g. Vercel), prepends import.meta.env.VITE_API_BASE_URL.
 */
export function getApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  // In development, prefer relative path so Vite proxy forwards to the backend on any dev port
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return endpoint;
  }
  const base = import.meta.env.VITE_API_BASE_URL || '';
  return base ? `${base.replace(/\/$/, '')}${endpoint}` : endpoint;
}

/**
 * Reads the current access token from session or local storage.
 */
export function getStoredAccessToken(): string | null {
  try {
    return sessionStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) ||
      localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) ||
      null;
  } catch {
    return null;
  }
}

/**
 * Reads the stored user profile from storage.
 */
export function getStoredUser<T = unknown>(): T | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEYS.USER) ||
      localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Persists session tokens and user profile to storage based on rememberMe.
 */
export function saveAuthSession(
  session: BackendAuthSession,
  user: unknown,
  company?: BackendAuthCompany,
  rememberMe = false
): void {
  const primaryStorage = rememberMe ? localStorage : sessionStorage;
  const secondaryStorage = rememberMe ? sessionStorage : localStorage;

  try {
    // Clear the other storage to avoid stale tokens
    secondaryStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    secondaryStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    secondaryStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    secondaryStorage.removeItem(AUTH_STORAGE_KEYS.COMPANY);

    primaryStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, session.access_token);
    if (session.refresh_token) {
      primaryStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, session.refresh_token);
    }
    primaryStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    if (company) {
      primaryStorage.setItem(AUTH_STORAGE_KEYS.COMPANY, JSON.stringify(company));
    }
    primaryStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, String(rememberMe));
  } catch {
    // Storage quota or restricted environments
  }
}

/**
 * Clears all authentication session items from both local and session storage.
 */
export function clearAuthSession(): void {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.COMPANY);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);

    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.COMPANY);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
  } catch {
    // Storage quota or restricted environments
  }
}

/**
 * Authenticates user credentials with the backend API.
 */
export async function login(payload: LoginPayload): Promise<LoginResult> {
  const url = getApiUrl('/api/v1/auth/login');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  let data: {
    success?: boolean;
    message?: string;
    code?: string;
    data?: LoginResult;
  };

  try {
    data = await response.json();
  } catch {
    throw new Error('Server returned an invalid response. Please try again.');
  }

  if (!response.ok || !data.success || !data.data) {
    const errorMsg = data.message || 'Invalid username or password. Please try again.';
    const error = new Error(errorMsg);
    (error as Error & { code?: string; status?: number }).code = data.code;
    (error as Error & { code?: string; status?: number }).status = response.status;
    throw error;
  }

  return data.data;
}

/**
 * Verifies session and fetches current user context using Bearer access token.
 */
export async function getCurrentUser(token?: string): Promise<MeResult> {
  const authToken = token || getStoredAccessToken();
  if (!authToken) {
    throw new Error('No authentication token available');
  }

  const url = getApiUrl('/api/v1/auth/me');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  let data: {
    success?: boolean;
    message?: string;
    data?: MeResult;
  };

  try {
    data = await response.json();
  } catch {
    throw new Error('Failed to parse user profile response');
  }

  if (!response.ok || !data.success || !data.data) {
    const errorMsg = data.message || 'Session expired or unverified';
    const error = new Error(errorMsg);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return data.data;
}

/**
 * Terminates user session on backend and clears local storage.
 */
export async function logout(): Promise<void> {
  const authToken = getStoredAccessToken();
  if (authToken) {
    try {
      const url = getApiUrl('/api/v1/auth/logout');
      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch {
      // Non-fatal: local session must be cleared regardless of network state
    }
  }

  clearAuthSession();
}
