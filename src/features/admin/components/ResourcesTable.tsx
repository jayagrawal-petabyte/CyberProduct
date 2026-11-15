/**
 * BrainMint Admin — Resource Directory Table
 * Scope: src/features/admin/components/ResourcesTable.tsx
 *
 * Renders the filtered/paged resource records in a table that mirrors
 * the DevicesTable/UsersTable styling (BrainMint design language).
 * Rows are clickable and expose an explicit "View details" action.
 *
 * This is an administrative directory only — no resource blocking,
 * access enforcement, or provisioning operations exist here.
 */

import React from 'react'
import {
  AdminResourceRecord,
  ResourceAccessLevel,
  ResourceCategory,
  RESOURCE_ACCESS_LABELS,
  RESOURCE_STATUS_LABELS,
  ResourceStatus,
} from '../types/resource.types'
import { Icon } from '../../../components/ui'
import './ResourcesTable.css'

interface ResourcesTableProps {
  resources: AdminResourceRecord[]
  isLoading: boolean
  /** True when filters are active and no records matched (vs. true empty dataset). */
  hasActiveFilters: boolean
  onViewDetails: (resource: AdminResourceRecord) => void
}

const COL_SPAN = 8

const CATEGORY_ICON: Record<ResourceCategory, 'external-link' | 'save' | 'settings' | 'shield' | 'file-text'> = {
  Websites: 'external-link',
  Applications: 'save',
  'Internal Tools': 'settings',
  'Cloud Resources': 'shield',
  Databases: 'file-text',
}

const CATEGORY_ICON_CLASS: Record<ResourceCategory, string> = {
  Websites: 'resources-category-icon--websites',
  Applications: 'resources-category-icon--applications',
  'Internal Tools': 'resources-category-icon--tools',
  'Cloud Resources': 'resources-category-icon--cloud',
  Databases: 'resources-category-icon--databases',
}

export function AccessBadge({ level }: { level: ResourceAccessLevel }) {
  return (
    <span className={`resources-access-badge resources-access-badge--${level}`}>
      {RESOURCE_ACCESS_LABELS[level]}
    </span>
  )
}

export function StatusBadge({ status }: { status: ResourceStatus }) {
  return (
    <span className={`resources-status-badge resources-status-badge--${status}`}>
      <span className={`resources-status-dot resources-status-dot--${status}`} aria-hidden="true" />
      {RESOURCE_STATUS_LABELS[status]}
    </span>
  )
}

export const ResourcesTable: React.FC<ResourcesTableProps> = ({
  resources,
  isLoading,
  hasActiveFilters,
  onViewDetails,
}) => {
  return (
    <div className="resources-table-scroll">
      <table className="resources-table">
        <thead>
          <tr>
            <th scope="col">Resource</th>
            <th scope="col">Resource ID</th>
            <th scope="col">Category</th>
            <th scope="col">Type</th>
            <th scope="col">Access Level</th>
            <th scope="col">Status</th>
            <th scope="col">Owner</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="resources-state" role="status" aria-live="polite">
                  <Icon name="clock" size={26} className="resources-icon-muted" />
                  <h2>Loading resource directory…</h2>
                  <p>Fetching the mock resource dataset.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading && resources.length === 0 && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="resources-state" role="status">
                  <Icon name="search" size={26} className="resources-icon-muted" />
                  {hasActiveFilters ? (
                    <>
                      <h2>No resources match these filters</h2>
                      <p>Try a different search term or filter combination.</p>
                    </>
                  ) : (
                    <>
                      <h2>No resources registered yet</h2>
                      <p>The resource directory is empty right now.</p>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )}

          {!isLoading &&
            resources.map((resource) => (
              <tr
                key={resource.id}
                className="resources-row"
                tabIndex={0}
                aria-label={`View details for ${resource.name}`}
                onClick={() => onViewDetails(resource)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onViewDetails(resource)
                  }
                }}
              >
                <td>
                  <div className="resources-resource-cell">
                    <span
                      className={`resources-category-icon ${CATEGORY_ICON_CLASS[resource.category]}`}
                      aria-hidden="true"
                    >
                      <Icon name={CATEGORY_ICON[resource.category]} size={14} />
                    </span>
                    <div className="resources-resource-meta">
                      <span className="resources-resource-name">{resource.name}</span>
                      <span className="resources-resource-identifier">{resource.identifier}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="resources-resource-id">{resource.resourceId}</span>
                </td>
                <td>
                  <span className="resources-cell-text">{resource.category}</span>
                </td>
                <td>
                  <span className="resources-type-text">{resource.type}</span>
                </td>
                <td>
                  <AccessBadge level={resource.access} />
                </td>
                <td>
                  <StatusBadge status={resource.status} />
                </td>
                <td>
                  <span className="resources-owner">{resource.ownerDepartment}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="resources-view-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDetails(resource)
                    }}
                    aria-label={`View details for ${resource.name}`}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResourcesTable
