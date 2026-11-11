/**
 * providers/index.ts
 *
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Barrel export for all global React context providers.
 */

export { AuthProvider } from '../../features/auth/context/AuthContext';
export { AuthContext } from '../../features/auth/context/authContextDef';
export type { AuthProviderProps, AuthContextValue } from '../../features/auth/context/authContextDef';
