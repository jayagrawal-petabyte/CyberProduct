/**
 * BrainMint Admin — Resource Details Modal
 * Scope: src/features/admin/components/ResourceDetailsModal.tsx
 *
 * View-only details sheet for a directory record. Built on the shared
 * BrainMint `Modal` (Escape-to-close, backdrop dismissal, labelled
 * dialog). No credentials, keys, or connection strings are shown by
 * design — this is an administrative directory interface.
 */

import React from 'react'
import { AdminResourceRecord } from '../types/resource.types'
import { Modal, Icon } from '../../../components/ui'
import { AccessBadge, StatusBadge } from './ResourcesTable'

interface ResourceDetailsModalProps {
  resource: AdminResourceRecord | null
  onClose: () => void
}

interface DetailRowProps {
  label: string
  value: React.ReactNode
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="resources-modal-row">
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
)

export const ResourceDetailsModal: React.FC<ResourceDetailsModalProps> = ({
  resource,
  onClose,
}) => {
  return (
    <Modal
      isOpen={resource !== null}
      onClose={onClose}
      title="Resource Details"
      description="Directory record — development mock data."
      maxWidth="md"
    >
      {resource && (
        <div className="resources-modal-body">
          {/* Identity block */}
          <div className="resources-modal-identity">
            <span className="resources-category-icon resources-category-icon--lg" aria-hidden="true">
              <Icon name="external-link" size={20} />
            </span>
            <div className="resources-modal-identity__meta">
              <strong>{resource.name}</strong>
              <span>{resource.category} · {resource.type}</span>
            </div>
            <span className="resources-modal-identity__status">
              <StatusBadge status={resource.status} />
            </span>
          </div>

          {/* Detail grid */}
          <dl className="resources-modal-details">
            <DetailRow
              label="Resource ID"
              value={<span className="resources-operator-code">{resource.resourceId}</span>}
            />
            <DetailRow label="Category" value={resource.category} />
            <DetailRow label="Type" value={resource.type} />
            <DetailRow
              label={resource.category === 'Websites' || resource.category === 'Applications' ? 'URL / Identifier' : 'Application Identifier'}
              value={<span className="resources-operator-code">{resource.identifier}</span>}
            />
            <DetailRow
              label="Access Classification"
              value={<AccessBadge level={resource.access} />}
            />
            <DetailRow label="Current Status" value={<StatusBadge status={resource.status} />} />
            <DetailRow label="Owner Department" value={resource.ownerDepartment} />
            <DetailRow label="Description" value={resource.description} />
            <DetailRow label="Created Date" value={resource.createdOn} />
            <DetailRow label="Last Updated" value={resource.lastUpdated} />
          </dl>
        </div>
      )}
    </Modal>
  )
}

export default ResourceDetailsModal
