/**
 * BrainMint Admin — Resource Directory Filters
 * Scope: src/features/admin/components/ResourceFilters.tsx
 *
 * Client-side search + category / type / access / status / owner
 * department filters. Mirrors the DeviceFilters filter row styling.
 */

import React from 'react'
import { ResourceFiltersState, DEFAULT_RESOURCE_FILTERS } from '../types/resource.types'
import { Icon } from '../../../components/ui'

interface ResourceFiltersProps {
  filters: ResourceFiltersState
  onChange: (next: ResourceFiltersState) => void
  categories: string[]
  types: string[]
  accessLevels: string[]
  statuses: string[]
  departments: string[]
  /** Number of resources matching the current filters. */
  resultCount: number
  /** Total resources in the dataset. */
  totalCount: number
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  filters,
  onChange,
  categories,
  types,
  accessLevels,
  statuses,
  departments,
  resultCount,
  totalCount,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.category !== 'all' ||
    filters.type !== 'all' ||
    filters.access !== 'all' ||
    filters.status !== 'all' ||
    filters.department !== 'all'

  return (
    <div className="resources-filters">
      {/* Search */}
      <div className="resources-search-wrap">
        <Icon name="search" size={15} />
        <input
          type="search"
          className="resources-search-input"
          placeholder="Search by resource name or ID…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search resources by name or resource ID"
        />
      </div>

      <span className="resources-filter-divider" aria-hidden="true" />

      {/* Category */}
      <select
        className="resources-filter-select"
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        aria-label="Filter by category"
      >
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <span className="resources-filter-divider" aria-hidden="true" />

      {/* Type */}
      <select
        className="resources-filter-select"
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
        aria-label="Filter by resource type"
      >
        <option value="all">All types</option>
        {types.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <span className="resources-filter-divider" aria-hidden="true" />

      {/* Access classification */}
      <select
        className="resources-filter-select"
        value={filters.access}
        onChange={(e) => onChange({ ...filters, access: e.target.value })}
        aria-label="Filter by access classification"
      >
        <option value="all">All access levels</option>
        {accessLevels.map((a) => (
          <option key={a} value={a}>
            {a === 'public' && 'Public'}
            {a === 'internal' && 'Internal'}
            {a === 'restricted' && 'Restricted'}
            {a === 'confidential' && 'Confidential'}
          </option>
        ))}
      </select>

      <span className="resources-filter-divider" aria-hidden="true" />

      {/* Status */}
      <select
        className="resources-filter-select"
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s === 'active' && 'Active'}
            {s === 'restricted' && 'Restricted'}
            {s === 'pending' && 'Pending Review'}
            {s === 'inactive' && 'Inactive'}
          </option>
        ))}
      </select>

      <span className="resources-filter-divider" aria-hidden="true" />

      {/* Owner department */}
      <select
        className="resources-filter-select"
        value={filters.department}
        onChange={(e) => onChange({ ...filters, department: e.target.value })}
        aria-label="Filter by owner department"
      >
        <option value="all">All departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          className="resources-filters-clear"
          onClick={() => onChange({ ...DEFAULT_RESOURCE_FILTERS })}
        >
          <Icon name="x" size={12} />
          Clear
        </button>
      )}

      <span className="resources-filter-count" role="status" aria-live="polite">
        {resultCount} of {totalCount} resources
      </span>
    </div>
  )
}

export default ResourceFilters
