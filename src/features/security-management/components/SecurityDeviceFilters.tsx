/**
 * BrainMint — Security Device Filters
 * Scope: src/features/security-management/components/SecurityDeviceFilters.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Search by device, owner or serial number plus a platform filter,
 * reusing the Security Policies toolbar chassis classes (.secpol-*),
 * with a dev-snapshot date chip and a Clear action whenever filters are
 * active. Posture filtering is handled by DevicePostureTabs above the table.
 */

import React from 'react'
import type { DeviceOs, SecurityDeviceFiltersState } from '../types/securityDevice.types'
import { DEFAULT_SECURITY_DEVICE_FILTERS } from '../types/securityDevice.types'
import { Icon } from '../../../components/ui'

interface SecurityDeviceFiltersProps {
  filters: SecurityDeviceFiltersState
  onChange: (next: SecurityDeviceFiltersState) => void
  platforms: DeviceOs[]
  resultCount: number
  totalCount: number
  /** Mock snapshot date shown in the date chip ("24 Oct 2026"). */
  snapshotDate: string
}

export const SecurityDeviceFilters: React.FC<SecurityDeviceFiltersProps> = ({
  filters,
  onChange,
  platforms,
  resultCount,
  totalCount,
  snapshotDate,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.os !== 'all' ||
    filters.posture !== 'all'

  return (
    <div className="secpol-filters">
      {/* Search — "Search device, owner or serial" */}
      <div className="secpol-search-wrap">
        <Icon name="search" size={14} className="secpol-search-icon" />
        <input
          type="search"
          className="secpol-search-input"
          placeholder="Search device, owner or serial"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search devices by name, ID, serial number or owner"
        />
      </div>

      {/* Platform filter */}
      <div className="secpol-select-wrap">
        <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
        <select
          className="secpol-filter-select"
          value={filters.os}
          onChange={(e) => onChange({ ...filters, os: e.target.value })}
          aria-label="Filter by platform"
        >
          <option value="all">All platforms</option>
          {platforms.map((os) => (
            <option key={os} value={os}>
              {os}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          className="secpol-filters-clear"
          onClick={() => onChange({ ...DEFAULT_SECURITY_DEVICE_FILTERS })}
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
        {resultCount} of {totalCount} devices match the current filters
      </span>
    </div>
  )
}

export default SecurityDeviceFilters
