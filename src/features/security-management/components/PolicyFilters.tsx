/**
 * BrainMint — Security Policies Library Filters
 * Scope: src/features/security-management/components/PolicyFilters.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Search by policy name or ID, plus state and category filter dropdowns
 * per the approved design ("All policy states"), with a dev-snapshot date
 * chip on the right and a Clear action whenever filters are active.
 */

import React from 'react'
import { PolicyFiltersState, DEFAULT_POLICY_FILTERS, PolicyState, POLICY_STATE_LABELS } from '../types/policy.types'
import { Icon } from '../../../components/ui'

interface PolicyFiltersProps {
  filters: PolicyFiltersState
  onChange: (next: PolicyFiltersState) => void
  categories: string[]
  resultCount: number
  totalCount: number
  /** Mock dataset snapshot date shown in the date chip ("24 Oct 2026"). */
  snapshotDate: string
}

/** All lifecycle states the data model supports (filter is forward-looking). */
const STATE_FILTER_OPTIONS: PolicyState[] = [
  'published',
  'under-review',
  'draft',
  'retired',
]

export const PolicyFilters: React.FC<PolicyFiltersProps> = ({
  filters,
  onChange,
  categories,
  resultCount,
  totalCount,
  snapshotDate,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.state !== 'all' ||
    filters.category !== 'all'

  return (
    <div className="secpol-filters">
      {/* Search — "Search policy name or ID" */}
      <div className="secpol-search-wrap">
        <Icon name="search" size={14} className="secpol-search-icon" />
        <input
          type="search"
          className="secpol-search-input"
          placeholder="Search policy name or ID"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search policies by name or ID"
        />
      </div>

      {/* State filter — mirrors "All policy states" */}
      <div className="secpol-select-wrap">
        <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
        <select
          className="secpol-filter-select"
          value={filters.state}
          onChange={(e) => onChange({ ...filters, state: e.target.value })}
          aria-label="Filter by policy state"
        >
          <option value="all">All policy states</option>
          {STATE_FILTER_OPTIONS.map((state) => (
            <option key={state} value={state}>
              {POLICY_STATE_LABELS[state]}
            </option>
          ))}
        </select>
      </div>

      {/* Category filter */}
      <div className="secpol-select-wrap">
        <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
        <select
          className="secpol-filter-select"
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          aria-label="Filter by policy category"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          className="secpol-filters-clear"
          onClick={() => onChange({ ...DEFAULT_POLICY_FILTERS })}
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
        {resultCount} of {totalCount} policies match the current filters
      </span>
    </div>
  )
}

export default PolicyFilters
