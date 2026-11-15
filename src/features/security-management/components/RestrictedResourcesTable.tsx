/**
 * BrainMint — Restricted Resources Directory Table
 * Scope: src/features/security-management/components/RestrictedResourcesTable.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Renders the filtered/paged resource records for the Restricted Resources
 * screen: RESOURCE | RESOURCE ID | CATEGORY | ACCESS | STATUS | OWNER |
 * UPDATED | ACTION (adapted from the Admin ResourcesTable column plan).
 * Rows are clickable (Enter/Space) and expose an explicit "Review →" action.
 *
 * This table is an administrative VISIBILITY surface only: it never blocks
 * access, grants access, or drives any enforcement decision.
 */

import React from 'react'
import type {
  AdminResourceRecord,
  ResourceAccessLevel,
  ResourceCategory,
  ResourceStatus,
} from '../types/restrictedResource.types'
import { RESOURCE_ACCESS_LABELS, RESOURCE_STATUS_LABELS } from '../types/restrictedResource.types'
import { Icon } from '../../../components/ui'
import './RestrictedResourcesTable.css'

interface RestrictedResourcesTableProps {
  resources: AdminResourceRecord[]
  isLoading: boolean
  /** True when filters/search are active and nothing matched. */
  hasActiveFilters: boolean
  onViewDetails: (resource: AdminResourceRecord) => void
}

const COL_SPAN = 8

/** Icon mapping per category, reused from the Admin Resources convention. */
const CATEGORY_ICON: Record<ResourceCategory, 'external-link' | 'save' | 'settings' | 'shield-check' | 'file-text'> = {
  Websites: 'external-link',
  Applications: 'save',
  'Internal Tools': 'settings',
  'Cloud Resources': 'shield-check',
  Databases: 'file-text',
}

const CATEGORY_CHIP_CLASS: Record<ResourceCategory, string> = {
  Websites: 'secres-category-chip--websites',
  Applications: 'secres-category-chip--applications',
  'Internal Tools': 'secres-category-chip--tools',
  'Cloud Resources': 'secres-category-chip--cloud',
  Databases: 'secres-category-chip--databases',
}

/** Dot + label status indicator (green / red / amber / grey). */
export function ResourceStatusIndicator({ status }: { status: ResourceStatus }) {
  return (
    <span className={`secres-status secres-status--${status}`}>
      <span className="secres-status-dot" aria-hidden="true" />
      {RESOURCE_STATUS_LABELS[status]}
    </span>
  )
}

/** Pill variant used inside the details modal. */
export function ResourceStatusPill({ status }: { status: ResourceStatus }) {
  return (
    <span className={`secres-status-pill secres-status-pill--${status}`}>
      <span className="secres-status-dot" aria-hidden="true" />
      {RESOURCE_STATUS_LABELS[status]}
    </span>
  )
}

/** Access classification pill. */
export function AccessBadge({ access }: { access: ResourceAccessLevel }) {
  return (
    <span className={`secres-access-badge secres-access-badge--${access}`}>
      {RESOURCE_ACCESS_LABELS[access]}
    </span>
  )
}

export const RestrictedResourcesTable: React.FC<RestrictedResourcesTableProps> = ({
  resources,
  isLoading,
  hasActiveFilters,
  onViewDetails,
}) => {
  return (
    <div className="secres-table-scroll">
      <table className="secres-table">
        <thead>
          <tr>
            <th scope="col">Resource</th>
            <th scope="col">Resource ID</th>
            <th scope="col">Category</th>
            <th scope="col">Access</th>
            <th scope="col">Status</th>
            <th scope="col">Owner</th>
            <th scope="col">Updated</th>
            <th scope="col" style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="secpol-state-panel" role="status" aria-live="polite">
                  <Icon name="refresh" size={24} className="secpol-spin" />
                  <h2>Loading restricted resource directory…</h2>
                  <p>Fetching the mock resource dataset.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading && resources.length === 0 && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="secpol-state-panel" role="status">
                  <Icon name="search" size={24} />
                  {hasActiveFilters ? (
                    <>
                      <h2>No resources match this search or filter</h2>
                      <p>Try a different resource name, ID, access classification or status.</p>
                    </>
                  ) : (
                    <>
                      <h2>No resources in the directory yet</h2>
                      <p>Add the first restricted resource to get started.</p>
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
                className="secres-row"
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
                  <div className="secres-resource-cell">
                    <span
                      className={`secres-category-chip ${CATEGORY_CHIP_CLASS[resource.category]}`}
                      aria-hidden="true"
                    >
                      <Icon name={CATEGORY_ICON[resource.category]} size={14} />
                    </span>
                    <div className="secres-resource-meta">
                      <span className="secres-resource-name">{resource.name}</span>
                      <span className="secres-resource-idline">{resource.identifier}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="secres-mono">{resource.resourceId}</span>
                </td>
                <td>
                  <span className="secres-cell-text">{resource.category}</span>
                </td>
                <td>
                  <AccessBadge access={resource.access} />
                </td>
                <td>
                  <ResourceStatusIndicator status={resource.status} />
                </td>
                <td>
                  <span className="secres-owner">{resource.ownerDepartment}</span>
                </td>
                <td>
                  <span className="secres-last-updated">{resource.lastUpdated}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="secres-action-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDetails(resource)
                    }}
                    aria-label={`Review ${resource.name}`}
                  >
                    Review
                    <Icon name="arrow-right" size={13} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default RestrictedResourcesTable
