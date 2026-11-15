/**
 * BrainMint Admin — Device Inventory Table
 * Scope: src/features/admin/components/DevicesTable.tsx
 *
 * Renders the filtered/paged device records in a table that mirrors
 * the UsersTable styling (BrainMint design language). Rows are
 * clickable and expose an explicit "View details" action.
 *
 * This is a monitoring interface only — no device scanning, endpoint
 * verification, or enforcement actions exist here.
 */

import React from 'react'
import {
  AdminDeviceRecord,
  DeviceComplianceStatus,
  DEVICE_COMPLIANCE_LABELS,
  DeviceOs,
  DeviceType,
} from '../types/device.types'
import { Icon } from '../../../components/ui'
import './DevicesTable.css'

interface DevicesTableProps {
  devices: AdminDeviceRecord[]
  isLoading: boolean
  /** True when filters are active and no records matched (vs. true empty dataset). */
  hasActiveFilters: boolean
  /* Map of employee email → full name, provided by the users dataset. */
  employeeNames: Record<string, string>
  onViewDetails: (device: AdminDeviceRecord) => void
}

const COL_SPAN = 8

/** Inline SVG icons per device type (shared Icon set has no tablet glyph,
 *  and it must not be modified — same approach as DashboardPage's icons). */
const TypeIcon: React.FC<{ type: DeviceType }> = ({ type }) => {
  const p = {
    width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none' as const,
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const, 'aria-hidden': true,
  }
  switch (type) {
    case 'Laptop':  return <svg {...p}><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9" /><path d="M4 16h16l1.28 2.55A1 1 0 0 1 20.38 20H3.62a1 1 0 0 1-.9-1.45L4 16z" /></svg>
    case 'Desktop': return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
    case 'Mobile':  return <svg {...p}><rect x="7" y="2" width="10" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
    case 'Tablet':  return <svg {...p}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
    default:        return null
  }
}

/** Small tag showing the OS platform next to the version. */
const OsTag: React.FC<{ os: DeviceOs }> = ({ os }) => (
  <span className="devices-os-name">{os}</span>
)

export function ComplianceBadge({ status }: { status: DeviceComplianceStatus }) {
  return (
    <span className={`devices-compliance-badge devices-compliance-badge--${status}`}>
      <span className={`devices-compliance-dot devices-compliance-dot--${status}`} aria-hidden="true" />
      {DEVICE_COMPLIANCE_LABELS[status]}
    </span>
  )
}

export const DevicesTable: React.FC<DevicesTableProps> = ({
  devices,
  isLoading,
  hasActiveFilters,
  employeeNames,
  onViewDetails,
}) => {
  return (
    <div className="devices-table-scroll">
      <table className="devices-table">
        <thead>
          <tr>
            <th scope="col">Device</th>
            <th scope="col">Device ID</th>
            <th scope="col">Assigned Employee</th>
            <th scope="col">Operating System</th>
            <th scope="col">Device Type</th>
            <th scope="col">Compliance Status</th>
            <th scope="col">Last Seen</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="devices-state" role="status" aria-live="polite">
                  <Icon name="clock" size={26} className="devices-icon-muted" />
                  <h2>Loading device inventory…</h2>
                  <p>Fetching the mock device dataset.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading && devices.length === 0 && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="devices-state" role="status">
                  <Icon name="search" size={26} className="devices-icon-muted" />
                  {hasActiveFilters ? (
                    <>
                      <h2>No devices match these filters</h2>
                      <p>Try a different search term or filter combination.</p>
                    </>
                  ) : (
                    <>
                      <h2>No devices registered yet</h2>
                      <p>The device inventory is empty right now.</p>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )}

          {!isLoading &&
            devices.map((device) => (
              <tr
                key={device.id}
                className="devices-row"
                tabIndex={0}
                aria-label={`View details for ${device.deviceName}`}
                onClick={() => onViewDetails(device)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onViewDetails(device)
                  }
                }}
              >
                <td>
                  <div className="devices-device-cell">
                    <span className="devices-type-icon" aria-hidden="true">
                      <TypeIcon type={device.deviceType} />
                    </span>
                    <div className="devices-device-meta">
                      <span className="devices-device-name">{device.deviceName}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="devices-device-id">{device.deviceId}</span>
                </td>
                <td>
                  <span className="devices-employee-name">
                    {employeeNames[device.assignedEmail] ?? device.assignedEmail}
                  </span>
                </td>
                <td>
                  <div className="devices-os-cell">
                    <OsTag os={device.os} />
                    <span className="devices-os-version">{device.osVersion}</span>
                  </div>
                </td>
                <td>
                  <span className="devices-type-text">{device.deviceType}</span>
                </td>
                <td>
                  <ComplianceBadge status={device.compliance} />
                </td>
                <td>
                  <span className="devices-last-seen">{device.lastSeen}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="devices-view-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDetails(device)
                    }}
                    aria-label={`View details for ${device.deviceName}`}
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

export default DevicesTable
