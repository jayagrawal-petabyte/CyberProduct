/**
 * BrainMint Admin — Device Details Modal
 * Scope: src/features/admin/components/DeviceDetailsModal.tsx
 *
 * View-only details sheet for an inventory record. Built on the shared
 * BrainMint `Modal` (Escape-to-close, backdrop dismissal, labelled
 * dialog). No credentials, tokens, or device secrets are shown by
 * design — this is an administrative monitoring interface.
 */

import React from 'react'
import { AdminDeviceRecord } from '../types/device.types'
import { Modal, Icon } from '../../../components/ui'
import { ComplianceBadge } from './DevicesTable'

interface DeviceDetailsModalProps {
  device: AdminDeviceRecord | null
  /** Employee email → display name map from the users dataset. */
  employeeNames: Record<string, string>
  onClose: () => void
}

interface DetailRowProps {
  label: string
  value: React.ReactNode
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="devices-modal-row">
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
)

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({
  device,
  employeeNames,
  onClose,
}) => {
  return (
    <Modal
      isOpen={device !== null}
      onClose={onClose}
      title="Device Details"
      description="Inventory record — development mock data."
      maxWidth="md"
    >
      {device && (
        <div className="devices-modal-body">
          {/* Identity block */}
          <div className="devices-modal-identity">
            <span className="devices-type-icon devices-type-icon--lg" aria-hidden="true">
              <Icon name="monitor" size={20} />
            </span>
            <div className="devices-modal-identity__meta">
              <strong>{device.deviceName}</strong>
              <span>Assigned to {employeeNames[device.assignedEmail] ?? device.assignedEmail}</span>
            </div>
            <span className="devices-modal-identity__status">
              <ComplianceBadge status={device.compliance} />
            </span>
          </div>

          {/* Detail grid */}
          <dl className="devices-modal-details">
            <DetailRow label="Device ID" value={<span className="devices-operator-code">{device.deviceId}</span>} />
            <DetailRow label="Assigned Employee" value={employeeNames[device.assignedEmail] ?? device.assignedEmail} />
            <DetailRow label="Employee Email" value={device.assignedEmail} />
            <DetailRow label="Operating System" value={`${device.os} — ${device.osVersion}`} />
            <DetailRow label="Device Type" value={device.deviceType} />
            <DetailRow
              label="Compliance Status"
              value={<ComplianceBadge status={device.compliance} />}
            />
            <DetailRow label="Last Seen" value={device.lastSeen} />
            <DetailRow label="Registered On" value={device.registeredOn} />
            <DetailRow label="Manufacturer" value={device.manufacturer} />
            <DetailRow
              label="Security Agent"
              value={<span className="devices-agent-text">{device.securityAgent}</span>}
            />
          </dl>
        </div>
      )}
    </Modal>
  )
}

export default DeviceDetailsModal
