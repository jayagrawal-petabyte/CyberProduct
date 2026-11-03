/**
 * BrainMint Auth Types
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  emailOrUsername?: string;
  password?: string;
  general?: string;
}

export type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'lead' | 'admin' | 'security';
}
