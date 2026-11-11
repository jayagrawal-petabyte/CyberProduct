import { useMemo } from 'react'
import type { ApprovalFilters as ApprovalFiltersState, ApprovalRequest } from '../types/approvalRequest'
import { ApprovalIcon } from './ApprovalIcon'

interface ApprovalFiltersProps {
  filters: ApprovalFiltersState
  requests: ApprovalRequest[]
  hasActiveFilters: boolean
  onChange: (updates: Partial<ApprovalFiltersState>) => void
  onClear: () => void
}

export function ApprovalFilters({ filters, requests, hasActiveFilters, onChange, onClear }: ApprovalFiltersProps) {
  const resources = useMemo(() => Array.from(new Set(requests.map((request) => request.resourceName))).sort(), [requests])
  return <div className="approval-filters">
    <div className="approval-filter-grid">
      <label className="approval-filter approval-filter--search">
        <span className="sr-only">Search employees or resources</span>
        <ApprovalIcon name="search" size={20} />
        <input
          type="search"
          value={filters.search}
          placeholder="Search employee or resource..."
          aria-label="Search employees or resources"
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </label>
      <label className="approval-filter">
        <span className="sr-only">Request status</span>
        <select value={filters.status} aria-label="Request status" onChange={(event) => onChange({ status: event.target.value as ApprovalFiltersState['status'] })}>
          <option value="all">Request Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <ApprovalIcon name="chevron-down" size={16} />
      </label>
      <label className="approval-filter">
        <span className="sr-only">Resource</span>
        <select value={filters.resource} aria-label="Resource" onChange={(event) => onChange({ resource: event.target.value })}>
          <option value="">Resource</option>
          {resources.map((resource) => <option key={resource} value={resource}>{resource}</option>)}
        </select>
        <ApprovalIcon name="chevron-down" size={16} />
      </label>
      <label className="approval-filter">
        <span className="sr-only">Date range</span>
        <select value={filters.dateRange} aria-label="Date range" onChange={(event) => onChange({ dateRange: event.target.value as ApprovalFiltersState['dateRange'] })}>
          <option value="all">Date Range</option>
          <option value="today">Today</option>
          <option value="last-7-days">Last 7 Days</option>
          <option value="last-30-days">Last 30 Days</option>
        </select>
        <ApprovalIcon name="chevron-down" size={16} />
      </label>
      <button className="clear-filters" type="button" disabled={!hasActiveFilters} onClick={onClear}>Clear Filters</button>
    </div>
  </div>
}
