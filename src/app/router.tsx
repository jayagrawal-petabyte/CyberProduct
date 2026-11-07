
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
import TeamLeadDashboardPage from '../features/dashboard/pages/TeamLeadDashboardPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import NotFoundPage from './NotFoundPage';
import EmployeeDashboardPage from '../features/employee/pages/EmployeeDashboardPage';
import MyDevicesPage from '../features/employee/pages/MyDevicesPage';
import RequestAccessPage from '../features/employee/pages/RequestAccessPage';
import MyPoliciesPage from '../features/employee/pages/MyPoliciesPage';
import MyRequestsPage from '../features/employee/pages/MyRequestsPage';
import { ProfilePage } from '../features/profile';
import { NotificationsPage } from '../features/notifications';
import { SecurityDashboardPage } from '../features/security/pages/SecurityDashboardPage';
import { SecurityAlertsPage } from '../features/security/pages/SecurityAlertsPage';
import { SecurityAuditLogsPage } from '../features/security/pages/SecurityAuditLogsPage';
import { EmployeeAccessActivityPage } from '../features/security/pages/EmployeeAccessActivityPage';
import { AccessDeniedPage } from '../features/security/pages/AccessDeniedPage';
import { SecurityLayout } from '../features/security';
import {
  SecurityPoliciesPage,
  RestrictedResourcesPage,
  NetworkCompliancePage,
  DeviceManagementPage,
  SecurityUsersPage,
} from '../features/security-management';

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
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/lead/profile',
    element: (
      <ProtectedRoute allowedRoles={['lead', 'admin']}>
        <ProfilePage />
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
        <ProfilePage />
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
      <ProtectedRoute allowedRoles={['employee']}>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employee/my-policies',
    element: (
      <ProtectedRoute allowedRoles={['employee']}>
        <MyPoliciesPage />
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

  // ── 5. Security Module (Aarushi Srivastava) ────────────────────────────────
  {
    path: '/security',
    element: (
      <ProtectedRoute allowedRoles={['security', 'admin']}>
        <SecurityLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <SecurityDashboardPage />,
      },
      {
        path: 'dashboard',
        element: <SecurityDashboardPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'audit-logs',
        element: <SecurityAuditLogsPage />,
      },
      {
        path: 'audit',
        element: <Navigate to="/security/audit-logs" replace />,
      },
      {
        path: 'alerts',
        element: <SecurityAlertsPage />,
      },
      {
        path: 'policies',
        element: <SecurityPoliciesPage />,
      },
      {
        path: 'restricted-resources',
        element: <RestrictedResourcesPage />,
      },
      {
        path: 'network-compliance',
        element: <NetworkCompliancePage />,
      },
      {
        path: 'devices',
        element: <DeviceManagementPage />,
      },
      {
        path: 'users',
        element: <SecurityUsersPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'employee-activity',
        element: <EmployeeAccessActivityPage />,
      },
      {
        path: 'access-denied',
        element: <AccessDeniedPage />,
      },
    ],
  },

  // ── 6. Error & Fallback Routes ─────────────────────────────────────────────
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;