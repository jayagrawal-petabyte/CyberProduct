import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  AdminResourceRecord,
  ResourceFiltersState,
  ResourceSummaryMetrics,
  DEFAULT_RESOURCE_FILTERS,
} from '../types/resource.types'
import { MOCK_RESOURCE_DIRECTORY } from './mockResourcesData'

export interface UseResourcesDataResult {
  resources: AdminResourceRecord[]
  summary: ResourceSummaryMetrics
  isLoading: boolean
  /** Dev-only indicator label; the dataset is mock data, not a CMDB feed. */
  lastUpdated: string
  refetch: () => void
}

/**
 * Reusable client-side filtering for the resource directory.
 * Search matches resource name or resource ID; the category, type,
 * access, status and owner-department filters combine with AND semantics.
 */
export function filterResources(
  resources: AdminResourceRecord[],
  filters: ResourceFiltersState,
): AdminResourceRecord[] {
  const q = filters.search.trim().toLowerCase()
  return resources.filter((resource) => {
    const matchesSearch =
      !q ||
      resource.name.toLowerCase().includes(q) ||
      resource.resourceId.toLowerCase().includes(q)
    const matchesCategory =
      filters.category === 'all' || resource.category === filters.category
    const matchesType = filters.type === 'all' || resource.type === filters.type
    const matchesAccess = filters.access === 'all' || resource.access === filters.access
    const matchesStatus = filters.status === 'all' || resource.status === filters.status
    const matchesDepartment =
      filters.department === 'all' || resource.ownerDepartment === filters.department
    return (
      matchesSearch &&
      matchesCategory &&
      matchesType &&
      matchesAccess &&
      matchesStatus &&
      matchesDepartment
    )
  })
}

/** Derives directory metrics from the dataset — never hardcoded. */
export function summarizeResources(
  resources: AdminResourceRecord[],
): ResourceSummaryMetrics {
  let active = 0
  let restricted = 0
  let pending = 0
  let inactive = 0
  for (const r of resources) {
    if (r.status === 'active') active += 1
    else if (r.status === 'restricted') restricted += 1
    else if (r.status === 'pending') pending += 1
    else inactive += 1
  }
  return { total: resources.length, active, restricted, pending, inactive }
}

function timestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
}

/**
 * State hook for the BrainMint admin Resource Management page.
 *
 * ⚠️ DEVELOPMENT MOCK DATA — serves the mock resource directory with a
 * simulated latency window so loading states can be exercised. This is
 * not a live CMDB/backend connection, and performs no access enforcement,
 * provisioning, or policy decisions.
 */
export function useResourcesData(): UseResourcesDataResult {
  const [resources, setResources] = useState<AdminResourceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('—')

  // Simulated initial fetch of the mock dataset.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResources(MOCK_RESOURCE_DIRECTORY)
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    window.setTimeout(() => {
      // Mock "refresh": re-serve the same dataset with a new timestamp.
      setResources([...MOCK_RESOURCE_DIRECTORY])
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 350)
  }, [])

  const summary = useMemo(() => summarizeResources(resources), [resources])

  return { resources, summary, isLoading, lastUpdated, refetch }
}

export { DEFAULT_RESOURCE_FILTERS }
