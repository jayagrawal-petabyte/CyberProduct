/**
 * BrainMint — Security User Filters
 * Scope: src/features/security-management/components/SecurityUserFilters.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Search by name, email or employee ID, plus role and department filters.
 * Reuses the .secpol-filters styling chassis.
 */

import React from 'react'
import type { SecurityUserFiltersState, SecurityUserRole } from '../types/securityUser.types'
import { Icon } from '../../../components/ui'

interface SecurityUserFiltersProps {
  filters: SecurityUserFiltersState
  onChange: (next: SecurityUserFiltersState) => void
  roles: SecurityUserRole[]
  departments: string[]
  resultCount: number
  totalCount: number
}

export const SecurityUserFilters: React.FC<SecurityUserFiltersProps> = ({
  filters,
  onChange,
  roles,
  departments,
  resultCount,
  totalCount,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.role !== 'all' ||
    filters.department !== 'all' ||
    filters.status !== 'all'

  return (
    <div className="secpol-filters">
      {/* Search by name, email or employee ID */}
      <div className="secpol-search-wrap">
        <Icon name="search" size={14} className="secpol-search-icon" />
        <input
          type="search"
          className="secpol-search-input"
          placeholder="Search by name, email, or employee ID…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search workforce by name, email, or employee ID"
        />
        {filters.search && (
          <button
            type="button"
            className="secpol-search-clear"
            onClick={() => onChange({ ...filters, search: '' })}
            aria-label="Clear search input"
          >
            <Icon name="x" size={13} />
          </button>
        )}
      </div>

      {/* Role filter */}
      <div className="secpol-select-wrap">
        <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
        <label htmlFor="secuser-role-select" className="secpol-visually-hidden">
          Filter by role
        </label>
        <select
          id="secuser-role-select"
          className="secpol-filter-select"
          value={filters.role}
          onChange={(e) => onChange({ ...filters, role: e.target.value })}
          aria-label="Filter workforce by role"
        >
          <option value="all">All roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Department filter */}
      <div className="secpol-select-wrap">
        <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
        <label htmlFor="secuser-dept-select" className="secpol-visually-hidden">
          Filter by department
        </label>
        <select
          id="secuser-dept-select"
          className="secpol-filter-select"
          value={filters.department}
          onChange={(e) => onChange({ ...filters, department: e.target.value })}
          aria-label="Filter workforce by department"
        >
          <option value="all">All departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Result count & Clear filters button */}
      {hasActiveFilters && (
        <button
          type="button"
          className="secpol-filters-clear"
          onClick={() =>
            onChange({
              search: '',
              role: 'all',
              department: 'all',
              status: 'all',
            })
          }
        >
          <Icon name="x" size={11} />
          Clear
        </button>
      )}

      {/* Screen-reader live region */}
      <span className="secpol-visually-hidden" role="status" aria-live="polite">
        {resultCount} of {totalCount} users match the current filters
      </span>
    </div>
  )
}

export default SecurityUserFilters

