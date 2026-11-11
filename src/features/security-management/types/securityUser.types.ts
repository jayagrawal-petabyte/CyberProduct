/**
 * BrainMint — Security User Management Types
 * Scope: src/features/security-management/types/securityUser.types.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * NOTE ON REUSE: Reuses user status and roles vocabulary from Admin User Management
 * (`src/features/admin/types/user.types.ts`) where appropriate, expanding with
 * invitations status and security user specific attributes.
 *
 * ⚠️ DEVELOPMENT MOCK DATA — records are for administrative VISIBILITY and mock review only.
 * Nothing on this screen provisions identities, alters credentials, changes live account status,
 * or enforces authentication privileges.
 */

export type SecurityUserRole =
  | 'Employee'
  | 'Team Lead'
  | 'Security Administrator'

export type SecurityUserStatus =
  | 'active'
  | 'suspended'
  | 'invited'

export interface SecurityUserRecord {
  id: string
  employeeId: string
  fullName: string
  email: string
  department: string
  role: SecurityUserRole
  status: SecurityUserStatus
  lastActive: string
  accountCreated: string
  // Additional security context
  designation?: string
  mfaEnabled?: boolean
  deviceCount?: number
  securityClearance?: 'Standard' | 'Elevated' | 'Admin'
}

export interface SecurityUserSummaryMetrics {
  total: number
  employees: number
  teamLeads: number
  securityAdmins: number
  active: number
  suspended: number
  invitations: number
}

export type SecurityUserTabFilter = 'all' | 'active' | 'suspended' | 'invited'

export interface SecurityUserFiltersState {
  search: string
  role: string // 'all' | SecurityUserRole
  status: SecurityUserTabFilter
  department: string // 'all' | department name
}

export const DEFAULT_SECURITY_USER_FILTERS: SecurityUserFiltersState = {
  search: '',
  role: 'all',
  status: 'all',
  department: 'all',
}

export interface InviteUserFormValues {
  fullName: string
  email: string
  department: string
  role: SecurityUserRole
}

export interface ManageUserFormValues {
  fullName: string
  email: string
  department: string
  role: SecurityUserRole
  status: SecurityUserStatus
}

