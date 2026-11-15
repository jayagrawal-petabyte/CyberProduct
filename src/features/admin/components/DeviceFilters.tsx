/**
 * BrainMint Admin — Device Inventory Filters
 * Scope: src/features/admin/components/DeviceFilters.tsx
 *
 * Client-side search + assigned-employee / OS / device-type /
 * compliance filters. Mirrors the UsersTable filter row styling.
 */

import React from 'react'
import { DeviceFiltersState, DEFAULT_DEVICE_FILTERS } from '../types/device.types'
import { Icon } from '../../../components/ui'

interface DeviceFiltersProps {
  filters: DeviceFiltersState
  onChange: (next: DeviceFiltersState) => void
  /** Employee dropdown entries: [email, displayName], sorted by name. */
  employees: Array<[string, string]>
  osOptions: string[]
  typeOptions: string[]
  /** Number of devices matching the current filters. */
  resultCount: number
  /** Total devices in the dataset. */
  totalCount: number
}

const COMPLIANCE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All compliance statuses' },
  { value: 'compliant', label: 'Compliant' },
  { value: 'non-compliant', label: 'Non-Compliant' },
  { value: 'pending', label: 'Pending Verification' },
]

export const DeviceFilters: React.FC<DeviceFiltersProps> = ({
  filters,
  onChange,
  employees,
  osOptions,
  typeOptions,
  resultCount,
  totalCount,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.employee !== 'all' ||
    filters.os !== 'all' ||
    filters.deviceType !== 'all' ||
    filters.compliance !== 'all'

  return (
    <div className="devices-filters">
      {/* Search */}
      <div className="devices-search-wrap">
        <Icon name="search" size={15} />
        <input
          type="search"
          className="devices-search-input"
          placeholder="Search by device name or ID…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search devices by name or device ID"
        />
      </div>

      <span className="devices-filter-divider" aria-hidden="true" />

      {/* Assigned employee */}
      <select
        className="devices-filter-select"
        value={filters.employee}
        onChange={(e) => onChange({ ...filters, employee: e.target.value })}
        aria-label="Filter by assigned employee"
      >
        <option value="all">All employees</option>
        {employees.map(([email, name]) => (
          <option key={email} value={email}>{name}</option>
        ))}
      </select>

      <span className="devices-filter-divider" aria-hidden="true" />

      {/* OS */}
      <select
        className="devices-filter-select"
        value={filters.os}
        onChange={(e) => onChange({ ...filters, os: e.target.value })}
        aria-label="Filter by operating system"
      >
        <option value="all">All platforms</option>
        {osOptions.map((os) => (
          <option key={os} value={os}>{os}</option>
        ))}
      </select>

      <span className="devices-filter-divider" aria-hidden="true" />

      {/* Device type */}
      <select
        className="devices-filter-select"
        value={filters.deviceType}
        onChange={(e) => onChange({ ...filters, deviceType: e.target.value })}
        aria-label="Filter by device type"
      >
        <option value="all">All device types</option>
        {typeOptions.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <span className="devices-filter-divider" aria-hidden="true" />

      {/* Compliance status */}
      <select
        className="devices-filter-select"
        value={filters.compliance}
        onChange={(e) => onChange({ ...filters, compliance: e.target.value })}
        aria-label="Filter by compliance status"
      >
        {COMPLIANCE_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          className="devices-filters-clear"
          onClick={() => onChange({ ...DEFAULT_DEVICE_FILTERS })}
        >
          <Icon name="x" size={12} />
          Clear
        </button>
      )}

      <span className="devices-filter-count" role="status" aria-live="polite">
        {resultCount} of {totalCount} devices
      </span>
    </div>
  )
}

export default DeviceFilters
