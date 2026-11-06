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
  employee: '/dashboard',
  security: '/security/profile',
};

export const EMPLOYEE_NAV_ITEMS: DockItem[] = [
  { id: 'dashboard', label: 'Employee Dashboard', icon: 'home', href: '/dashboard' },
  { id: 'devices', label: 'My Devices', icon: 'monitor', href: '/employee/my-devices' },
  { id: 'requests', label: 'Request Access', icon: 'diamond-plus', href: '/employee/access-requests/new' },
  { id: 'approvals', label: 'My Requests', icon: 'file-text', href: '/employee/access-requests' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', href: '/employee/notifications' },
];

export const LEAD_NAV_ITEMS: DockItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home', href: '/lead/dashboard' },
  { id: 'approvals', label: 'Access Requests', icon: 'file-text', href: '/lead/approvals' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', href: '/lead/notifications' },
];

export const ADMIN_NAV_ITEMS: DockItem[] = [
  { id: 'dashboard', label: 'Admin Dashboard', icon: 'grid', href: '/admin' },
  { id: 'users', label: 'Users', icon: 'user', href: '/admin/users' },
  { id: 'devices', label: 'Devices', icon: 'monitor', href: '/admin/devices' },
  { id: 'resources', label: 'Resources', icon: 'file-text', href: '/admin/resources' },
];

export const SECURITY_NAV_ITEMS: DockItem[] = [
  { id: 'dashboard', label: 'Security Dashboard', icon: 'grid', href: '/security/profile' },
  { id: 'alerts', label: 'Notifications', icon: 'bell', href: '/security/notifications' },
  { id: 'audit', label: 'Audit Logs', icon: 'file-text', href: '/security/profile' },
  { id: 'profile', label: 'Security Profile', icon: 'user', href: '/security/profile' },
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
