/**
 * Application Router
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Route Registry & Navigation Architecture:
 * - Public authentication routes (/login, /forgot-password)
 * - Protected dashboard and approval workspaces
 * - Role-based route authorization guards
 * - BrainMint 404 fallback handling for unmapped routes
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import DashboardPage from '../features/admin/pages/DashboardPage';
import ApprovalInboxPage from '../features/approvals/pages/ApprovalInboxPage';
import ApprovalDetailPage from '../features/approvals/pages/ApprovalDetailPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import NotFoundPage from './NotFoundPage';

export const router = createBrowserRouter([
  // ── 1. Root & Authentication Routes ─────────────────────────────────────────
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },

  // ── 2. Admin Dashboard Module (Ishaan Gupta) ──────────────────────────────
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/dashboard',
    element: <Navigate to="/admin" replace />,
  },

  // ── 3. Team Lead / Approvals Module (Harsh Gupta) ─────────────────────────
  {
    path: '/approvals',
    element: (
      <ProtectedRoute allowedRoles={['lead', 'admin']}>
        <ApprovalInboxPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/approvals/:id',
    element: (
      <ProtectedRoute allowedRoles={['lead', 'admin']}>
        <ApprovalDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/lead',
    element: <Navigate to="/lead/approvals" replace />,
  },
  {
    path: '/lead/approvals',
    element: (
      <ProtectedRoute allowedRoles={['lead', 'admin']}>
        <ApprovalInboxPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/lead/approvals/:id',
    element: (
      <ProtectedRoute allowedRoles={['lead', 'admin']}>
        <ApprovalDetailPage />
      </ProtectedRoute>
    ),
  },

  // ── 4. Unbuilt Teammate Feature Slots ──────────────────────────────────────
  // Note: Following project guidelines, only pages that actually exist are
  // registered. As teammates implement their pages, import and register them here:
  // - Employee Portal (Aastha Singh): /employee/*
  // - Alerts & Audit Center (Aarushi Srivastava): /security/*
  // - Admin Subpages (Ishaan Gupta): /admin/users, /admin/devices, /admin/policies
  // - Approvals Grants (Harsh Gupta): /approvals/grants

  // ── 5. Error & Fallback Routes ─────────────────────────────────────────────
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
