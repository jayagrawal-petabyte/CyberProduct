/**
 * BrainMint — Network Zone Filters
 * Scope: src/features/security-management/components/NetworkZoneFilters.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Search by zone name plus status filter, reusing the Security Policies
 * toolbar chassis classes (.secpol-*), with a dev-snapshot date chip and a
 * Clear action whenever filters are active.
 */

import React from 'react'
import type { NetworkZoneFiltersState, NetworkZoneStatus } from '../types/networkCompliance.types'
import { DEFAULT_NETWORK_ZONE_FILTERS, NETWORK_ZONE_STATUS_LABELS } from '../types/networkCompliance.types'
import { Icon } from '../../../components/ui'

interface NetworkZoneFiltersProps {
  filters: NetworkZoneFiltersState
  onChange: (next: NetworkZoneFiltersState) => void
  statuses: string[]
  resultCount: number
  totalCount: number
  /** Mock snapshot date shown in the date chip ("24 Oct 2026"). */
  snapshotDate: string
}

export const NetworkZoneFilters: React.FC<NetworkZoneFiltersProps> = ({
  filters,
  onChange,
  statuses,
  resultCount,
  totalCount,
  snapshotDate,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'all'

  return (
    <div className="secpol-filters">
      {/* Search — "Search zone name" */}
      <div className="secpol-search-wrap">
        <Icon name="search" size={14} className="secpol-search-icon" />
        <input
          type="search"
          className="secpol-search-input"
          placeholder="Search zone name"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search network zones by name"
        />
      </div>

      {/* Status filter */}
      <div className="secpol-select-wrap">
        <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
        <select
          className="secpol-filter-select"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          aria-label="Filter by zone status"
        >
          <option value="all">All zone statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {NETWORK_ZONE_STATUS_LABELS[status as NetworkZoneStatus] ?? status}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          className="secpol-filters-clear"
          onClick={() => onChange({ ...DEFAULT_NETWORK_ZONE_FILTERS })}
        >
          <Icon name="x" size={11} />
          Clear
        </button>
      )}

      {/* Snapshot date chip (right side of the toolbar, as designed) */}
      <span className="secpol-date-chip" title="Development mock snapshot">
        <Icon name="calendar" size={13} />
        {snapshotDate}
      </span>

      {/* Live result count for screen readers */}
      <span className="secpol-visually-hidden" role="status" aria-live="polite">
        {resultCount} of {totalCount} zones match the current filters
      </span>
    </div>
  )
}

export default NetworkZoneFilters
