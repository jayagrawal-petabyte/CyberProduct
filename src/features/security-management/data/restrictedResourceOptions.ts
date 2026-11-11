/**
 * BrainMint — Restricted Resources Data Options
 * Scope: src/features/security-management/data/restrictedResourceOptions.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * ⚠️ DEVELOPMENT MOCK DATA — everything here reuses the Admin resource
 * mock directory (`MOCK_RESOURCE_DIRECTORY`); this screen serves the same
 * fictional dev dataset. No backend, CMDB or enforcement logic exists.
 * No credentials, connection strings, or secrets are included by design.
 */

import type {
  ResourceType,
} from '../../admin/types/resource.types'
import type { ResourceCategory } from '../../admin/types/resource.types'
import {
  MOCK_RESOURCE_DIRECTORY,
  RESOURCE_ACCESS_OPTIONS,
  RESOURCE_STATUS_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
} from '../../admin/hooks/mockResourcesData'
import { RESOURCE_ACCESS_LABELS, RESOURCE_STATUS_LABELS } from '../../admin/types/resource.types'

/** The dataset this screen serves (Admin mock directory, reused verbatim). */
export const RESTRICTED_RESOURCE_DIRECTORY_SOURCE = MOCK_RESOURCE_DIRECTORY

/** Category filter options — the five groups per the approved design. */
export const RESTRICTED_CATEGORY_OPTIONS: ResourceCategory[] = [
  'Websites',
  'Applications',
  'Internal Tools',
  'Cloud Resources',
  'Databases',
]

/** Access classification filter option values. */
export const RESTRICTED_ACCESS_OPTIONS = RESOURCE_ACCESS_OPTIONS

/** Status filter option values. */
export const RESTRICTED_STATUS_OPTIONS = RESOURCE_STATUS_OPTIONS

/** Re-exported labels (single source of truth in the Admin module). */
export { RESOURCE_ACCESS_LABELS, RESOURCE_STATUS_LABELS, RESOURCE_TYPE_OPTIONS }

/**
 * Category → valid resource-type options, derived once at module load from
 * the mock dataset itself (so the form never offers an impossible pairing).
 */
export const RESTRICTED_CATEGORY_TYPE_OPTIONS: Record<ResourceCategory, ResourceType[]> = (() => {
  const map = {} as Record<ResourceCategory, ResourceType[]>
  for (const category of RESTRICTED_CATEGORY_OPTIONS) map[category] = []
  for (const record of MOCK_RESOURCE_DIRECTORY) {
    const bucket = map[record.category]
    if (bucket && !bucket.includes(record.type)) bucket.push(record.type)
  }
  return map
})()
