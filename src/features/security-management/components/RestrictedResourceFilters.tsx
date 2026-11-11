/**
 * BrainMint — Restricted Resources Directory Filters
 * Scope: src/features/security-management/components/RestrictedResourceFilters.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Search by resource name or ID, plus category, access classification and
 * status dropdowns per the design, reusing the Security Policies toolbar
 * chassis classes (.secpol-*), with a dev-snapshot date chip and a Clear
 * action whenever filters are active.
 */

import React from 'react'
import type { RestrictedResourceFiltersState } from '../types/restrictedResource.types'
import { DEFAULT_RESTRICTED_RESOURCE_FILTERS } from '../types/restrictedResource.types'
import { RESOURCE_ACCESS_LABELS, RESOURCE_STATUS_LABELS } from '../types/restrictedResource.types'
import { Icon } from '../../../components/ui'

interface RestrictedResourceFiltersProps {
  filters: RestrictedResourceFiltersState
  onChange: (next: RestrictedResourceFiltersState) => void
  categories: string[]
  accessLevels: string[]
  statuses: string[]
  resultCount: number
  totalCount: number
  /** Mock dataset snapshot date shown in the date chip ("24 Oct 2026"). */
  snapshotDate: string
}

export const RestrictedResourceFilters: React.FC<RestrictedResourceFiltersProps> = ({
  filters,
  onChange,
  categories,
  accessLevels,
  statuses,
  resultCount,
  totalCount,
  snapshotDate,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.category !== 'all' ||
    filters.access !== 'all' ||
    filters.status !== 'all'

  return (
    <div className="secpol-filters">
      {/* Search — "Search resource name or ID" */}
      <div className="secpol-search-wrap">
        <Icon name="search" size={14} className="secpol-search-icon" />
        <input
          type="search"
          className="secpol-search-input"
          placeholder="Search resource name or ID"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search resources by name or resource ID"
        />
      </div>

      {/* Category filter */}
      <div className="secpol-select-wrap">
        <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
        <select
          className="secpol-filter-select"
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          aria-label="Filter by resource category"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Access classification filter */}
      <div className="secpol-select-wrap">
        <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
        <select
          className="secpol-filter-select"
          value={filters.access}
          onChange={(e) => onChange({ ...filters, access: e.target.value })}
          aria-label="Filter by access classification"
        >
          <option value="all">All access classifications</option>
          {accessLevels.map((level) => (
            <option key={level} value={level}>
              {RESOURCE_ACCESS_LABELS[level as keyof typeof RESOURCE_ACCESS_LABELS] ?? level}
            </option>
          ))}
        </select>
      </div>

      {/* Status filter */}
      <div className="secpol-select-wrap">
        <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
        <select
          className="secpol-filter-select"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          aria-label="Filter by resource status"
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {RESOURCE_STATUS_LABELS[status as keyof typeof RESOURCE_STATUS_LABELS] ?? status}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          className="secpol-filters-clear"
          onClick={() => onChange({ ...DEFAULT_RESTRICTED_RESOURCE_FILTERS })}
        >
          <Icon name="x" size={11} />
          Clear
        </button>
      )}

      {/* Snapshot date chip (right side of the toolbar, as designed) */}
      <span className="secpol-date-chip" title="Development mock data snapshot">
        <Icon name="calendar" size={13} />
        {snapshotDate}
      </span>

      {/* Live result count for screen readers and after-filter feedback */}
      <span className="secpol-visually-hidden" role="status" aria-live="polite">
        {resultCount} of {totalCount} resources match the current filters
      </span>
    </div>
  )
}

export default RestrictedResourceFilters
