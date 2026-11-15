/**
 * BrainMint Admin — Resource Management Types
 * Scope: src/features/admin/types/resource.types.ts
 */

/** High-level grouping of the organizational resource. */
export type ResourceCategory =
  | 'Websites'
  | 'Applications'
  | 'Internal Tools'
  | 'Cloud Resources'
  | 'Databases'

/** Technical form of the resource (more specific than category). */
export type ResourceType =
  | 'Public Website'
  | 'Web Application'
  | 'Desktop Application'
  | 'Mobile Application'
  | 'Admin Console'
  | 'Deployment Pipeline'
  | 'Compute Instance'
  | 'Object Storage'
  | 'Role-Based Access'
  | 'Relational Database'
  | 'NoSQL Database'
  | 'Analytics Warehouse'

/** Access classification tier of the resource. */
export type ResourceAccessLevel = 'public' | 'internal' | 'restricted' | 'confidential'

/** Operational status of the resource record. */
export type ResourceStatus = 'active' | 'restricted' | 'pending' | 'inactive'

/**
 * A single organizational resource in the admin directory.
 *
 * ⚠️ Intentionally excludes credentials, connection strings, keys, or
 * any secrets — this record is for administrative *visibility* only.
 */
export interface AdminResourceRecord {
  /** Internal record id. */
  id: string
  /** Business-facing resource identifier, e.g. "BM-RES-2101". */
  resourceId: string
  /** Human-friendly resource name. */
  name: string
  /** Resource grouping. */
  category: ResourceCategory
  /** Technical form of the resource. */
  type: ResourceType
  /** URL for websites/apps, or an application identifier for tools. */
  identifier: string
  /** Access classification tier. */
  access: ResourceAccessLevel
  /** Operational status. */
  status: ResourceStatus
  /** Department that owns the resource. */
  ownerDepartment: string
  /** Human-friendly "last updated" label, e.g. "2 days ago". */
  lastUpdated: string
  /** Human-friendly creation date, e.g. "Feb 12, 2023". */
  createdOn: string
  /** Short description of the resource. */
  description: string
}

/** Aggregated resource metrics (derived from the dataset, never hardcoded). */
export interface ResourceSummaryMetrics {
  total: number
  active: number
  restricted: number
  pending: number
  inactive: number
}

/** Client-side filter state for the resource directory. */
export interface ResourceFiltersState {
  /** Matches resource name or resource ID (case-insensitive). */
  search: string
  /** Category name or 'all'. */
  category: string
  /** Resource type or 'all'. */
  type: string
  /** Access classification or 'all'. */
  access: string
  /** Operational status or 'all'. */
  status: string
  /** Owner department or 'all'. */
  department: string
}

/** Default (empty) filter state. */
export const DEFAULT_RESOURCE_FILTERS: ResourceFiltersState = {
  search: '',
  category: 'all',
  type: 'all',
  access: 'all',
  status: 'all',
  department: 'all',
}

/** Display labels for access levels. */
export const RESOURCE_ACCESS_LABELS: Record<ResourceAccessLevel, string> = {
  public: 'Public',
  internal: 'Internal',
  restricted: 'Restricted',
  confidential: 'Confidential',
}

/** Display labels for resource statuses. */
export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  active: 'Active',
  restricted: 'Restricted',
  pending: 'Pending Review',
  inactive: 'Inactive',
}
