/**
 * BrainMint — Security Device Inventory Table
 * Scope: src/features/security-management/components/SecurityDevicesTable.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Renders the filtered/paged endpoint records:
 * DEVICE | ASSIGNED EMPLOYEE | PLATFORM | SECURITY POSTURE | LAST CHECK | ACTION.
 * Rows are clickable (Enter/Space) and expose "Inspect →" for details plus
 * "Remediate →" for non-compliant/quarantined devices.
 *
 * Read-only visibility surface — "Remediate" is a local prototype affordance;
 * nothing is remediated, quarantined, or enforced from here.
 */

import React from 'react'
import type {
  DeviceOs,
  DevicePosture,
  SecurityDeviceRecord,
} from '../types/securityDevice.types'
import { DEVICE_POSTURE_LABELS } from '../types/securityDevice.types'
import { Icon } from '../../../components/ui'
import './SecurityDevicesTable.css'

interface SecurityDevicesTableProps {
  devices: SecurityDeviceRecord[]
  isLoading: boolean
  /** True when filters/search are active and nothing matched. */
  hasActiveFilters: boolean
  onInspect: (device: SecurityDeviceRecord) => void
  /** LOCAL PROTOTYPE ONLY — displays the honest no-remediation notice. */
  onRemediate: (device: SecurityDeviceRecord) => void
}

const COL_SPAN = 6

/** OS icon mapping for the platform chips. */
const OS_ICON: Record<DeviceOs, 'monitor' | 'laptop' | 'smartphone'> = {
  Windows: 'laptop',
  macOS: 'laptop',
  Linux: 'monitor',
  iOS: 'smartphone',
  Android: 'smartphone',
}

/** Dot + label posture indicator (green / amber / red). */
export function DevicePostureIndicator({ posture }: { posture: DevicePosture }) {
  return (
    <span className={`secdev-posture secdev-posture--${posture}`}>
      <span className="secdev-posture-dot" aria-hidden="true" />
      {DEVICE_POSTURE_LABELS[posture]}
    </span>
  )
}

/** Pill variant used inside the details modal. */
export function DevicePosturePill({ posture }: { posture: DevicePosture }) {
  return (
    <span className={`secdev-posture-pill secdev-posture-pill--${posture}`}>
      <span className="secdev-posture-dot" aria-hidden="true" />
      {DEVICE_POSTURE_LABELS[posture]}
    </span>
  )
}

export const SecurityDevicesTable: React.FC<SecurityDevicesTableProps> = ({
  devices,
  isLoading,
  hasActiveFilters,
  onInspect,
  onRemediate,
}) => {
  return (
    <div className="secdev-table-scroll">
      <table className="secdev-table">
        <thead>
          <tr>
            <th scope="col">Device</th>
            <th scope="col">Assigned employee</th>
            <th scope="col">Platform</th>
            <th scope="col">Security posture</th>
            <th scope="col">Last check</th>
            <th scope="col" style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="secpol-state-panel" role="status" aria-live="polite">
                  <Icon name="refresh" size={24} className="secpol-spin" />
                  <h2>Loading device inventory…</h2>
                  <p>Fetching the mock endpoint dataset.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading && devices.length === 0 && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="secpol-state-panel" role="status">
                  <Icon name="search" size={24} />
                  {hasActiveFilters ? (
                    <>
                      <h2>No devices match this search, platform or posture</h2>
                      <p>Try a different device, owner, serial, platform or tab.</p>
                    </>
                  ) : (
                    <>
                      <h2>No devices enrolled yet</h2>
                      <p>Endpoints will appear once the inventory is connected.</p>
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
                className="secdev-row"
                tabIndex={0}
                aria-label={`Inspect ${device.deviceName}`}
                onClick={() => onInspect(device)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onInspect(device)
                  }
                }}
              >
                <td>
                  <div className="secdev-device-cell">
                    <span
                      className={`secdev-platform-chip secdev-platform-chip--${device.os}`}
                      aria-hidden="true"
                    >
                      <Icon name={OS_ICON[device.os]} size={14} />
                    </span>
                    <div className="secdev-device-meta">
                      <span className="secdev-device-name">{device.deviceName}</span>
                      <span className="secdev-device-idline">{device.deviceId}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="secdev-employee-meta">
                    <span className="secdev-employee-name">{device.assignedName}</span>
                    <span className="secdev-employee-email">{device.assignedEmail}</span>
                  </div>
                </td>
                <td>
                  <span className="secdev-cell-text">{device.os} · {device.osVersion}</span>
                </td>
                <td>
                  <DevicePostureIndicator posture={device.posture} />
                </td>
                <td>
                  <span className="secdev-last-check">{device.lastCheck}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="secdev-action-group">
                    <button
                      type="button"
                      className="secdev-action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onInspect(device)
                      }}
                      aria-label={`Inspect ${device.deviceName}`}
                    >
                      Inspect
                      <Icon name="arrow-right" size={13} />
                    </button>
                    {device.posture !== 'compliant' && (
                      <button
                        type="button"
                        className="secdev-action-btn secdev-action-btn--remediate"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemediate(device)
                        }}
                        aria-label={`Remediate ${device.deviceName} (local prototype — no remediation performed)`}
                      >
                        Remediate
                        <Icon name="arrow-right" size={13} />
                      </button>
                    )}
                  </span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default SecurityDevicesTable
