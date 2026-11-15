/**
 * useAuth Hook
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/authContextDef';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
