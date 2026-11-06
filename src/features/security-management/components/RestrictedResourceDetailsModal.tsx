/**
 * BrainMint — Restricted Resource Details Modal
 * Scope: src/features/security-management/components/RestrictedResourceDetailsModal.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * View-only details sheet built on the shared BrainMint `Modal`
 * (Escape-to-close, backdrop dismissal, body scroll lock) and the shared
 * security-management modal chassis classes (.secpol-*). Shows directory
 * information only — no access is granted, revoked, or enforced from here.
 * An "Edit resource" action hands the record back to the page for the
 * local edit form.
 */

import React from 'react'
import type { AdminResourceRecord } from '../types/restrictedResource.types'
import { Modal, Icon } from '../../../components/ui'
import { AccessBadge, ResourceStatusPill } from './RestrictedResourcesTable'

interface RestrictedResourceDetailsModalProps {
  resource: AdminResourceRecord | null
  onClose: () => void
  /** Opens the Add/Edit form in edit mode for this record. */
  onEdit: (resource: AdminResourceRecord) => void
}

interface DetailRowProps {
  label: string
  value: React.ReactNode
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="secpol-modal-row">
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
)

export const RestrictedResourceDetailsModal: React.FC<RestrictedResourceDetailsModalProps> = ({
  resource,
  onClose,
  onEdit,
}) => {
  /**
   * Restriction note appears only for records marked restricted or
   * confidential — it restates the screen's honesty contract.
   */
  const restrictionNote =
    resource !== null && resource.status === 'restricted'
      ? 'Marked restricted — visibility record only. This screen does not block or grant access.'
      : resource !== null && resource.access === 'confidential'
        ? 'Confidential classification — handling rules live with the data-governance policies, not here.'
        : null

  return (
    <Modal
      isOpen={resource !== null}
      onClose={onClose}
      title="Resource details"
      description="Directory record — development mock data. No enforcement."
      maxWidth="md"
    >
      {resource && (
        <div className="secpol-modal-body">
          {/* Identity block */}
          <div className="secpol-modal-identity">
            <div className="secpol-modal-identity__meta">
              <strong>{resource.name}</strong>
              <span>
                {resource.resourceId} · {resource.category}
              </span>
            </div>
            <ResourceStatusPill status={resource.status} />
          </div>

          <p className="secpol-modal-desc">{resource.description}</p>

          {/* Detail grid */}
          <dl className="secpol-modal-details">
            <DetailRow
              label="Resource ID"
              value={<span className="secpol-mono">{resource.resourceId}</span>}
            />
            <DetailRow label="Category" value={resource.category} />
            <DetailRow label="Type" value={resource.type} />
            <DetailRow
              label="Identifier"
              value={<span className="secpol-mono">{resource.identifier}</span>}
            />
            <DetailRow
              label="Access classification"
              value={<AccessBadge access={resource.access} />}
            />
            <DetailRow label="Status" value={<ResourceStatusPill status={resource.status} />} />
            <DetailRow label="Owner department" value={resource.ownerDepartment} />
            <DetailRow label="Created" value={resource.createdOn} />
            <DetailRow label="Updated" value={resource.lastUpdated} />
          </dl>

          {/* Restriction / classification note (visibility-only reminder) */}
          {restrictionNote && (
            <div
              className={`secres-restriction-box${resource.access === 'confidential' && resource.status !== 'restricted' ? ' secres-restriction-box--confidential' : ''}`}
              role="note"
            >
              <Icon name="lock" size={13} />
              <span>{restrictionNote}</span>
            </div>
          )}
        </div>
      )}
      {resource && (
        <div className="secpol-modal-footer">
          <button type="button" className="secpol-btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="secpol-btn-primary"
            onClick={() => onEdit(resource)}
          >
            <Icon name="edit" size={13} />
            Edit resource
          </button>
        </div>
      )}
    </Modal>
  )
}

export default RestrictedResourceDetailsModal
