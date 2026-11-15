/**
 * BrainMint — Security Device Details Modal
 * Scope: src/features/security-management/components/SecurityDeviceDetailsModal.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Inspection sheet built on the shared BrainMint `Modal` (Escape-to-close,
 * backdrop dismissal, body scroll lock) and the shared security-management
 * modal chassis classes (.secpol-*). Shows identity, serial, assignee,
 * platform, posture, last check and compliance notes — visibility only.
 * Displays an honest local-prototype remediation notice where applicable.
 */

import React from 'react'
import type { SecurityDeviceRecord } from '../types/securityDevice.types'
import { Modal, Icon } from '../../../components/ui'
import { DevicePosturePill } from './SecurityDevicesTable'
import './SecurityDevicesTable.css'

interface SecurityDeviceDetailsModalProps {
  device: SecurityDeviceRecord | null
  onClose: () => void
  /** LOCAL PROTOTYPE ONLY — displays the honest no-remediation notice. */
  onRemediate: (device: SecurityDeviceRecord) => void
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

export const SecurityDeviceDetailsModal: React.FC<SecurityDeviceDetailsModalProps> = ({
  device,
  onClose,
  onRemediate,
}) => {
  return (
    <Modal
      isOpen={device !== null}
      onClose={onClose}
      title="Device details"
      description="Inventory record — development mock data. No enforcement."
      maxWidth="md"
    >
      {device && (
        <div className="secpol-modal-body">
          {/* Identity block */}
          <div className="secpol-modal-identity">
            <div className="secpol-modal-identity__meta">
              <strong>{device.deviceName}</strong>
              <span>
                {device.deviceId} · {device.manufacturer}
              </span>
            </div>
            <DevicePosturePill posture={device.posture} />
          </div>

          {/* Detail grid */}
          <dl className="secpol-modal-details">
            <DetailRow
              label="Device ID"
              value={<span className="secpol-mono">{device.deviceId}</span>}
            />
            <DetailRow
              label="Serial number"
              value={<span className="secpol-mono">{device.serialNumber}</span>}
            />
            <DetailRow
              label="Assigned employee"
              value={
                <span>
                  {device.assignedName}
                  {' '}
                  <span className="secpol-mono">({device.assignedEmail})</span>
                </span>
              }
            />
            <DetailRow label="Platform" value={device.os} />
            <DetailRow label="OS version" value={device.osVersion} />
            <DetailRow label="Device type" value={device.deviceType} />
            <DetailRow label="Manufacturer" value={device.manufacturer} />
            <DetailRow label="Security agent" value={device.securityAgent} />
            <DetailRow label="Last check" value={device.lastCheck} />
            <DetailRow label="Registered on" value={device.registeredOn} />
          </dl>

          {/* Compliance information / mock restriction note */}
          {device.complianceNote && (
            <div
              className={`secdev-note-box${device.posture === 'quarantined' ? ' secdev-note-box--quarantined' : ''}`}
              role="note"
            >
              <Icon name="alert-triangle" size={13} />
              <span>
                <strong>Compliance note:</strong> {device.complianceNote}
                {' '}This is a mock note — no restriction or remediation is
                applied from this screen.
              </span>
            </div>
          )}
          {device.posture === 'compliant' && (
            <div className="secpol-ack-box" aria-label="Posture summary">
              <div className="secpol-ack-box__head">
                <Icon name="check-circle" size={14} />
                <span>Device meets all posture requirements in the mock snapshot.</span>
              </div>
            </div>
          )}
        </div>
      )}
      {device && (
        <div className="secpol-modal-footer">
          <button type="button" className="secpol-btn-ghost" onClick={onClose}>
            Close
          </button>
          {device.posture !== 'compliant' && (
            <button
              type="button"
              className="secpol-btn-primary"
              onClick={() => onRemediate(device)}
              aria-label="Remediate (local prototype — no remediation performed)"
            >
              <Icon name="key" size={13} />
              Remediate
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}

export default SecurityDeviceDetailsModal
