/**
 * BrainMint Role Navigation Definitions
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Configures role-based navigation and access permissions for:
 * - Employee (Aastha Singh / Portal)
 * - Team Lead (Harsh Gupta / Approvals)
 * - Admin (Ishaan Gupta / Dashboard & Policies)
 */

import type { DockItem } from '../components/shared/FloatingDock';
import type { UserRole } from '../features/auth/types/auth.types';

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  admin: '/admin',
  lead: '/lead/dashboard',
  employee: '/employee',
  security: '/security',
};

export const EMPLOYEE_NAV_ITEMS: DockItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'house', href: '/employee' },
  { id: 'devices', label: 'My Devices', icon: 'devices', href: '/employee/my-devices' },
  { id: 'request-access', label: 'Request Access', icon: 'diamond-plus', href: '/employee/access-requests' },
  { id: 'policies', label: 'Policies', icon: 'file-check' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', href: '/employee/notifications' },
  { id: 'profile', label: 'Profile', icon: 'user-circle', href: '/employee/profile' },
];

export interface LeadNavItem extends Omit<DockItem, 'href'> {
  href: string;
  matchPaths?: string[];
}

export const LEAD_NAV_ITEMS: LeadNavItem[] = [
  {
    id: 'dashboard',
    label: 'Lead Dashboard',
    icon: 'house',
    href: '/lead',
    matchPaths: ['/lead', '/lead/dashboard'],
  },
  {
    id: 'approvals',
    label: 'Access Requests',
    icon: 'diamond-plus',
    href: '/lead/approvals',
    matchPaths: ['/lead/approvals', '/approvals'],
  },
  {
    id: 'history',
    label: 'Approval History',
    icon: 'history',
    href: '/lead/approval-history',
    matchPaths: ['/lead/approval-history'],
  },
  {
    id: 'activity',
    label: 'Employee Access Activity',
    icon: 'chart-line',
    href: '/lead/employee-activity',
    matchPaths: ['/lead/employee-activity'],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'bell',
    href: '/lead/notifications',
    matchPaths: ['/lead/notifications'],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'user-circle',
    href: '/lead/profile',
    matchPaths: ['/lead/profile'],
  },
];

export const ADMIN_NAV_ITEMS: DockItem[] = [
  { id: 'dashboard', label: 'Admin Dashboard', icon: 'grid', href: '/admin' },
  { id: 'users', label: 'Users', icon: 'user', href: '/admin/users' },
  { id: 'devices', label: 'Devices', icon: 'monitor', href: '/admin/devices' },
  { id: 'resources', label: 'Resources', icon: 'file-text', href: '/admin/resources' },
];

export interface SecurityNavItem extends Omit<DockItem, 'href'> {
  href: string;
  matchPaths?: string[];
}

export const SECURITY_NAV_ITEMS: SecurityNavItem[] = [
  {
    id: 'dashboard',
    label: 'Security Dashboard',
    icon: 'house',
    href: '/security',
    matchPaths: ['/security', '/security/dashboard'],
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'users',
    href: '/security/users',
  },
  {
    id: 'devices',
    label: 'Security Device Management',
    icon: 'monitor-check',
    href: '/security/devices',
  },
  {
    id: 'network-compliance',
    label: 'Network Compliance',
    icon: 'network',
    href: '/security/network-compliance',
  },
  {
    id: 'restricted-resources',
    label: 'Restricted Resources',
    icon: 'lock',
    href: '/security/restricted-resources',
  },
  {
    id: 'policies',
    label: 'Security Policies',
    icon: 'clipboard-check',
    href: '/security/policies',
  },
  {
    id: 'alerts',
    label: 'Security Alerts',
    icon: 'bell-ring',
    href: '/security/alerts',
  },
  {
    id: 'audit-logs',
    label: 'Security Audit Logs',
    icon: 'clipboard-list',
    href: '/security/audit-logs',
    matchPaths: ['/security/audit-logs', '/security/audit'],
  },
  {
    id: 'notifications',
    label: 'Security Notifications',
    icon: 'bell',
    href: '/security/notifications',
  },
  {
    id: 'profile',
    label: 'Security Profile',
    icon: 'user-circle',
    href: '/security/profile',
  },
];

export function getNavItemsForRole(role?: UserRole): DockItem[] {
  switch (role) {
    case 'admin':
      return ADMIN_NAV_ITEMS;
    case 'lead':
      return LEAD_NAV_ITEMS;
    case 'security':
      return SECURITY_NAV_ITEMS;
    case 'employee':
    default:
      return EMPLOYEE_NAV_ITEMS;
  }
}

/**
 * Checks whether the given pathname is authorized for the given role.
 */
export function isRouteAllowedForRole(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return false;
  }
  if ((pathname.startsWith('/approvals') || pathname.startsWith('/lead')) && role !== 'lead' && role !== 'admin') {
    return false;
  }
  if (pathname.startsWith('/security') && role !== 'security' && role !== 'admin') {
    return false;
  }
  if (pathname.startsWith('/employee') && role !== 'employee' && role !== 'admin') {
    return false;
  }
  return true;
}
