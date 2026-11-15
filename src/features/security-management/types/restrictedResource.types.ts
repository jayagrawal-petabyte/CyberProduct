/**
 * BrainMint — Restricted Resources Types
 * Scope: src/features/security-management/types/restrictedResource.types.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * NOTE ON REUSE: the record shape, categories, access classifications and
 * status vocabulary are intentionally reused from the Admin resource module
 * (`src/features/admin/types/resource.types.ts`) so both directories stay
 * in sync. This module only defines what is Security-Management-specific.
 *
 * ⚠️ Records are for administrative VISIBILITY only. Nothing on this screen
 * blocks, grants, or enforces resource access — those are backend/security
 * engine responsibilities. No credentials or secrets are stored by design.
 */

import type { AdminResourceRecord } from '../../admin/types/resource.types'

// Re-used vocabulary and record shape from the Admin resource module:
export type {
  AdminResourceRecord,
  ResourceCategory,
  ResourceAccessLevel,
  ResourceStatus,
  ResourceFiltersState,
  ResourceType,
} from '../../admin/types/resource.types'

// Re-used display labels (single source of truth in the Admin module):
export { RESOURCE_ACCESS_LABELS, RESOURCE_STATUS_LABELS } from '../../admin/types/resource.types'

/**
 * Values collected by the Add resource / Edit resource form.
 * Record ids, created/updated labels are assigned by the data hook.
 */
export type RestrictedResourceFormValues = Pick<
  AdminResourceRecord,
  | 'name'
  | 'category'
  | 'type'
  | 'identifier'
  | 'access'
  | 'status'
  | 'ownerDepartment'
  | 'description'
>

/** Client-side filter state for the restricted-resource directory. */
export interface RestrictedResourceFiltersState {
  /** Matches resource name or resource ID (case-insensitive). */
  search: string
  /** Category name or 'all'. */
  category: string
  /** Access classification or 'all'. */
  access: string
  /** Operational status or 'all'. */
  status: string
}

/** Default (empty) filter state. */
export const DEFAULT_RESTRICTED_RESOURCE_FILTERS: RestrictedResourceFiltersState = {
  search: '',
  category: 'all',
  access: 'all',
  status: 'all',
}

/**
 * Derived directory metrics — computed from the dataset, never hardcoded.
 * Shape is the Admin summary (total/active/restricted/pending/inactive);
 * the summary cards on the page derive from these counts.
 */
export type RestrictedResourceSummary = {
  total: number
  active: number
  restricted: number
  pending: number
  inactive: number
}
