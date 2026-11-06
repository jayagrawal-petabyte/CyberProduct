/**
 * BrainMint — Restricted Resources Data Hook
 * Scope: src/features/security-management/hooks/useRestrictedResources.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * ⚠️ DEVELOPMENT MOCK DATA — serves the mock resource directory (reused from
 * the Admin resource module) with a simulated latency window so loading
 * states can be exercised. This is not a live backend/CMDB connection and
 * performs NO access blocking, granting, revocation or enforcement.
 *
 * Local add/edit operations are in-memory ONLY: records created through the
 * form are temporary mock entries, cleared on reload, never saved to a
 * backend. Search/filter/summary/reuse logic is shared with the Admin
 * resource module (`filterResources`, `summarizeResources`).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  filterResources,
  summarizeResources,
} from '../../admin/hooks/useResourcesData'
import type { AdminResourceRecord, ResourceFiltersState } from '../../admin/types/resource.types'
import { DEFAULT_RESOURCE_FILTERS } from '../../admin/types/resource.types'
import type {
  RestrictedResourceFiltersState,
  RestrictedResourceFormValues,
  RestrictedResourceSummary,
} from '../types/restrictedResource.types'
import type { ResourceCategory } from '../../admin/types/resource.types'
import { RESTRICTED_RESOURCE_DIRECTORY_SOURCE, RESTRICTED_CATEGORY_TYPE_OPTIONS } from '../data/restrictedResourceOptions'

export interface UseRestrictedResourcesResult {
  resources: AdminResourceRecord[]
  summary: RestrictedResourceSummary
  isLoading: boolean
  /** Dev-only indicator string; the dataset is mock data, not a CMDB feed. */
  lastUpdated: string
  refetch: () => void
  /** Owner departments present in the dataset (for the Add/Edit form). */
  departments: string[]
  /** LOCAL PROTOTYPE ONLY — appends a temporary in-memory resource record. */
  createLocalResource: (values: RestrictedResourceFormValues) => AdminResourceRecord
  /** LOCAL PROTOTYPE ONLY — applies a form edit to an existing record. */
  updateLocalResource: (
    existing: AdminResourceRecord,
    values: RestrictedResourceFormValues,
  ) => AdminResourceRecord
}

/**
 * Narrowed reuse of the Admin `filterResources`: this screen exposes search +
 * category + access classification + status only (type/room/department
 * filters stay 'all' and therefore do not constrain the result).
 */
export function filterRestrictedResources(
  resources: AdminResourceRecord[],
  filters: RestrictedResourceFiltersState,
): AdminResourceRecord[] {
  const narrowed: ResourceFiltersState = {
    ...DEFAULT_RESOURCE_FILTERS,
    search: filters.search,
    category: filters.category,
    access: filters.access,
    status: filters.status,
  }
  return filterResources(resources, narrowed)
}

/** Timestamp for the "mock refreshed" indicator. */
function timestamp(): string {
  return (
    new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' UTC'
  )
}

/**
 * Next mock business ID ("BM-RES-…") — max numeric suffix in the dataset + 1.
 * Locally added records keep the directory's ID vocabulary.
 */
let localResourceSeq = 0
function nextResourceId(resources: AdminResourceRecord[]): string {
  localResourceSeq += 1
  let max = 2000
  for (const record of resources) {
    // Extract the trailing numeric suffix of "BM-RES-2101" → 2101.
    const match = record.resourceId.match(/\d+$/)
    const parsed = match ? Number(match[0]) : NaN
    if (Number.isFinite(parsed) && parsed > max) max = parsed
  }
  return `BM-RES-${max + localResourceSeq}`
}

export function useRestrictedResources(): UseRestrictedResourcesResult {
  const [resources, setResources] = useState<AdminResourceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('—')

  // Ref mirror so local-create can compute IDs without stale state reads.
  const resourcesRef = useRef<AdminResourceRecord[]>([])
  useEffect(() => {
    resourcesRef.current = resources
  }, [resources])

  // Simulated initial fetch of the mock dataset.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResources(RESTRICTED_RESOURCE_DIRECTORY_SOURCE)
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    window.setTimeout(() => {
      setResources((prev) => [...prev])
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 350)
  }, [])

  /**
   * LOCAL PROTOTYPE ONLY — appends a temporary mock record to the in-memory
   * dataset. Not persisted; cleared on page reload; enforces nothing.
   */
  const createLocalResource = useCallback(
    (values: RestrictedResourceFormValues): AdminResourceRecord => {
      const record: AdminResourceRecord = {
        ...values,
        id: `rr-tmp-${localResourceSeq + 1}`,
        resourceId: nextResourceId(resourcesRef.current),
        createdOn: 'Just now',
        lastUpdated: 'Just now (local draft)',
      }
      setResources((prev) => [...prev, record])
      return record
    },
    [],
  )

  /**
   * LOCAL PROTOTYPE ONLY — patches an existing in-memory record.
   * The directory never modifies real access on any system.
   */
  const updateLocalResource = useCallback(
    (
      existing: AdminResourceRecord,
      values: RestrictedResourceFormValues,
    ): AdminResourceRecord => {
      const updated: AdminResourceRecord = {
        ...existing,
        ...values,
        lastUpdated: 'Just now (local edit)',
      }
      setResources((prev) =>
        prev.map((resource) => (resource.id === updated.id ? updated : resource)),
      )
      return updated
    },
    [],
  )

  const summary = useMemo(
    () => summarizeResources(resources) as RestrictedResourceSummary,
    [resources],
  )

  const departments = useMemo(
    () =>
      Array.from(new Set(resources.map((r) => r.ownerDepartment))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [resources],
  )

  return {
    resources,
    summary,
    isLoading,
    lastUpdated,
    refetch,
    departments,
    createLocalResource,
    updateLocalResource,
  }
}

/** Category → type helper re-exported for the form modal. */
export function typesForCategory(category: ResourceCategory | ''): string[] {
  if (!category) return []
  return RESTRICTED_CATEGORY_TYPE_OPTIONS[category] ?? []
}
