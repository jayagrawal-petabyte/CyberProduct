/**
 * BrainMint ProtectedRoute Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Route guard managing authentication and role-based access:
 * - Redirects unauthenticated users to /login when real authentication state is active
 * - Enforces role-based boundaries when user authorization information is available
 * - Provides graceful development pass-through when backend auth is not yet connected
 * - Renders BrainMint loading fallback during authentication initialization
 */

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth.types';
import { LoadingFallback } from '../../../app/LoadingFallback';
import { ROLE_HOME_ROUTES } from '../../../layouts/navigation';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectPath = '/login',
}) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, isBackendReady } = useAuth();

  // 1. Loading state if authentication state needs to be initialized
  if (isLoading) {
    return <LoadingFallback message="Verifying session..." />;
  }

  // 2. When real authentication state is active, unauthenticated users are directed to /login
  if (isBackendReady && !isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // 3. When authorization information is available, prevent cross-role page access
  if (user && allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = allowedRoles.includes(user.role);
    if (!isAuthorized) {
      const fallbackRoute = ROLE_HOME_ROUTES[user.role] || '/dashboard';
      return <Navigate to={fallbackRoute} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
