/**
 * BrainMint Admin — Employee Directory Filters
 * Scope: src/features/admin/components/UserFilters.tsx
 *
 * Client-side search + department / role / status filters.
 * Mirrors the DashboardPage `.admin-table-controls` filter row styling.
 */

import React from 'react'
import { UserFiltersState, DEFAULT_USER_FILTERS } from '../types/user.types'
import { Icon } from '../../../components/ui'

interface UserFiltersProps {
  filters: UserFiltersState
  onChange: (next: UserFiltersState) => void
  departments: string[]
  roles: string[]
  /** Number of employees matching the current filters. */
  resultCount: number
  /** Total employees in the dataset. */
  totalCount: number
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
]

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onChange,
  departments,
  roles,
  resultCount,
  totalCount,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.department !== 'all' ||
    filters.role !== 'all' ||
    filters.status !== 'all'

  return (
    <div className="users-filters">
      {/* Search */}
      <div className="users-search-wrap">
        <Icon name="search" size={15} />
        <input
          type="search"
          className="users-search-input"
          placeholder="Search by name, email, or ID…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search employees by name, email, or employee ID"
        />
      </div>

      <span className="users-filter-divider" aria-hidden="true" />

      {/* Department */}
      <select
        className="users-filter-select"
        value={filters.department}
        onChange={(e) => onChange({ ...filters, department: e.target.value })}
        aria-label="Filter by department"
      >
        <option value="all">All departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <span className="users-filter-divider" aria-hidden="true" />

      {/* Role */}
      <select
        className="users-filter-select"
        value={filters.role}
        onChange={(e) => onChange({ ...filters, role: e.target.value })}
        aria-label="Filter by role"
      >
        <option value="all">All roles</option>
        {roles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <span className="users-filter-divider" aria-hidden="true" />

      {/* Status */}
      <select
        className="users-filter-select"
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        aria-label="Filter by account status"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          className="users-filters-clear"
          onClick={() => onChange({ ...DEFAULT_USER_FILTERS })}
        >
          <Icon name="x" size={12} />
          Clear
        </button>
      )}

      <span className="users-filter-count" role="status" aria-live="polite">
        {resultCount} of {totalCount} employees
      </span>
    </div>
  )
}

export default UserFilters
