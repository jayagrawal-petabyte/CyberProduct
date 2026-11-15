/**
 * BrainMint Admin — User Management Types
 * Scope: src/features/admin/types/user.types.ts
 */

/** Account status taxonomy used across the user directory. */
export type UserAccountStatus = 'active' | 'inactive' | 'suspended'

/** Role taxonomy available in the organization. */
export type UserRole = 'Administrator' | 'Manager' | 'Employee' | 'Security Analyst'

/**
 * A single employee record in the admin directory.
 *
 * ⚠️ Intentionally excludes credentials, tokens, or any sensitive
 * authentication material — the directory is for account *visibility* only.
 */
export interface AdminUserRecord {
  /** Internal record id. */
  id: string
  /** Business-facing employee identifier, e.g. "BM-ENG-0412". */
  employeeId: string
  fullName: string
  email: string
  /** Formal job designation (not the access role). */
  designation: string
  /** Department name, e.g. "Engineering". */
  department: string
  /** Access role granted to the account. */
  role: UserRole
  /** Current account status. */
  status: UserAccountStatus
  /** Number of enrolled devices linked to the account. */
  deviceCount: number
  /** Human-friendly "last seen" label, e.g. "2 hours ago". */
  lastActive: string
  /** Human-friendly account creation date, e.g. "Jan 12, 2023". */
  accountCreated: string
}

/** Aggregated directory metrics (all derived from the dataset, never hardcoded). */
export interface UserSummaryMetrics {
  total: number
  active: number
  inactive: number
  suspended: number
}

/** Client-side filter state for the directory. */
export interface UserFiltersState {
  /** Matches full name, email, or employee ID (case-insensitive). */
  search: string
  /** Department name or 'all'. */
  department: string
  /** Role name or 'all'. */
  role: string
  /** Account status or 'all'. */
  status: string
}

/** Default (empty) filter state. */
export const DEFAULT_USER_FILTERS: UserFiltersState = {
  search: '',
  department: 'all',
  role: 'all',
  status: 'all',
}
