
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import {
  DashboardPage,
  UsersPage,
  DevicesPage,
  ResourcesPage,
} from '../features/admin';
import ApprovalInboxPage from '../features/approvals/pages/ApprovalInboxPage';
import ApprovalDetailPage from '../features/approvals/pages/ApprovalDetailPage';
import ApprovalHistoryPage from '../features/approvals/pages/ApprovalHistoryPage';
import LeadEmployeeActivityPage from '../features/approvals/pages/LeadEmployeeActivityPage';
import LeadNotificationsPage from '../features/approvals/pages/LeadNotificationsPage';
import LeadProfilePage from '../features/approvals/pages/LeadProfilePage';
import TeamLeadDashboardPage from '../features/dashboard/pages/TeamLeadDashboardPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import NotFoundPage from './NotFoundPage';
import EmployeeDashboardPage from '../features/employee/pages/EmployeeDashboardPage';
import MyProfilePage from '../features/employee/pages/MyProfilePage';
import MyDevicesPage from '../features/employee/pages/MyDevicesPage';
import RequestAccessPage from '../features/employee/pages/RequestAccessPage';
import MyRequestsPage from '../features/employee/pages/MyRequestsPage';
import SecurityProfilePage from '../features/security/pages/SecurityProfilePage';
import { SecurityDashboardPage } from '../features/security/pages/SecurityDashboardPage';
import { SecurityAlertsPage } from '../features/security/pages/SecurityAlertsPage';
import { SecurityAuditLogsPage } from '../features/security/pages/SecurityAuditLogsPage';
import { EmployeeAccessActivityPage } from '../features/security/pages/EmployeeAccessActivityPage';
import { AccessDeniedPage } from '../features/security/pages/AccessDeniedPage';
import { NotificationsPage } from '../features/notifications';

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

  // ── 2. Admin Management Module (Ishaan Gupta) ──────────────────────────────
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
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <UsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/devices',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DevicesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/resources',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <ResourcesPage />
      </ProtectedRoute>
    ),
  },

  // ── 3. Team Lead / Approvals Module (Harsh Gupta) ─────────────────────────
  {
    path: '/lead/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['lead', 'admin']}>
        <TeamLeadDashboardPage />
      </ProtectedRoute>
    ),
  },
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
    element: <Navigate to="/lead/dashboard" replace />,
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
  {
    path: '/lead/approval-history',
    element: (
      <ProtectedRoute allowedRoles={['lead', 'admin']}>
        <ApprovalHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/lead/employee-activity',
    element: (
      <ProtectedRoute allowedRoles={['lead', 'admin']}>
        <LeadEmployeeActivityPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/lead/notifications',
    element: (
      <ProtectedRoute allowedRoles={['lead', 'admin']}>
        <LeadNotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/lead/profile',
    element: (
      <ProtectedRoute allowedRoles={['lead', 'admin']}>
        <LeadProfilePage />
      </ProtectedRoute>
    ),
  },

  // ── 4. Employee Portal (Aastha Singh) ─────────────────────────────
  {
    path: '/employee',
    element: (
      <ProtectedRoute allowedRoles={['employee']}>
        <EmployeeDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employee/profile',
    element: (
      <ProtectedRoute allowedRoles={['employee']}>
        <MyProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employee/my-devices',
    element: (
      <ProtectedRoute allowedRoles={['employee']}>
        <MyDevicesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employee/access-requests/new',
    element: (
      <ProtectedRoute allowedRoles={['employee']}>
        <RequestAccessPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employee/access-requests',
    element: (
      <ProtectedRoute allowedRoles={['employee']}>
        <MyRequestsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employee/notifications',
    element: (
      <ProtectedRoute allowedRoles={['employee', 'admin']}>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },

  // ── 5. Security Module (Aarushi Srivastava) ────────────────────────────────
  {
    path: '/security/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['security', 'admin']}>
        <SecurityDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/security/alerts',
    element: (
      <ProtectedRoute allowedRoles={['security', 'admin']}>
        <SecurityAlertsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/security/audit',
    element: (
      <ProtectedRoute allowedRoles={['security', 'admin']}>
        <SecurityAuditLogsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/security/employee-activity',
    element: (
      <ProtectedRoute allowedRoles={['security', 'admin']}>
        <EmployeeAccessActivityPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/security/profile',
    element: (
      <ProtectedRoute allowedRoles={['security', 'admin']}>
        <SecurityProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/security/notifications',
    element: (
      <ProtectedRoute allowedRoles={['security', 'admin']}>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/security/access-denied',
    element: (
      <ProtectedRoute>
        <AccessDeniedPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/security',
    element: <Navigate to="/security/dashboard" replace />,
  },

  // ── 6. Error & Fallback Routes ─────────────────────────────────────────────
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;