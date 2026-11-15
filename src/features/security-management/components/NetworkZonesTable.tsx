/**
 * BrainMint — Monitored Network Zones Table
 * Scope: src/features/security-management/components/NetworkZonesTable.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Renders the filtered/paged network zone records:
 * NETWORK ZONE | CONNECTIONS | COMPLIANCE | STATUS.
 * Read-only visibility surface — no scanning, enforcement or blocking.
 */

import React from 'react'
import type {
  NetworkZoneKind,
  NetworkZoneRecord,
  NetworkZoneStatus,
} from '../types/networkCompliance.types'
import { NETWORK_ZONE_KIND_LABELS, NETWORK_ZONE_STATUS_LABELS } from '../types/networkCompliance.types'
import { Icon } from '../../../components/ui'
import './NetworkZonesTable.css'

interface NetworkZonesTableProps {
  zones: NetworkZoneRecord[]
  isLoading: boolean
  /** True when filters/search are active and nothing matched. */
  hasActiveFilters: boolean
}

const COL_SPAN = 4

/** Chip icon + tone per zone classification. */
const KIND_CHIP: Record<NetworkZoneKind, { icon: 'lock' | 'home' | 'grid' | 'external-link' | 'key' | 'alert-triangle'; cls: string }> = {
  vpn: { icon: 'lock', cls: 'secnet-zone-chip--vpn' },
  office: { icon: 'home', cls: 'secnet-zone-chip--office' },
  cloud: { icon: 'grid', cls: 'secnet-zone-chip--cloud' },
  guest: { icon: 'external-link', cls: 'secnet-zone-chip--guest' },
  partner: { icon: 'key', cls: 'secnet-zone-chip--partner' },
  untrusted: { icon: 'alert-triangle', cls: 'secnet-zone-chip--untrusted' },
}

/** Dot + label zone status indicator (green / amber / red). */
export function ZoneStatusIndicator({ status }: { status: NetworkZoneStatus }) {
  return (
    <span className={`secnet-status secnet-status--${status}`}>
      <span className="secnet-status-dot" aria-hidden="true" />
      {NETWORK_ZONE_STATUS_LABELS[status]}
    </span>
  )
}

export const NetworkZonesTable: React.FC<NetworkZonesTableProps> = ({
  zones,
  isLoading,
  hasActiveFilters,
}) => {
  return (
    <div className="secnet-table-scroll">
      <table className="secnet-table">
        <thead>
          <tr>
            <th scope="col">Network zone</th>
            <th scope="col">Connections</th>
            <th scope="col">Compliance</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="secpol-state-panel" role="status" aria-live="polite">
                  <Icon name="refresh" size={24} className="secpol-spin" />
                  <h2>Loading monitored zones…</h2>
                  <p>Fetching the mock network snapshot.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading && zones.length === 0 && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="secpol-state-panel" role="status">
                  <Icon name="search" size={24} />
                  {hasActiveFilters ? (
                    <>
                      <h2>No zones match this search or filter</h2>
                      <p>Try a different zone name or status filter.</p>
                    </>
                  ) : (
                    <>
                      <h2>No zones monitored yet</h2>
                      <p>Network zones will appear once the monitor is connected.</p>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )}

          {!isLoading &&
            zones.map((zone) => {
              const chip = KIND_CHIP[zone.kind]
              return (
                <tr key={zone.id} className="secnet-row">
                  <td>
                    <div className="secnet-zone-cell">
                      <span className={`secnet-zone-chip ${chip.cls}`} aria-hidden="true">
                        <Icon name={chip.icon} size={14} />
                      </span>
                      <div className="secnet-zone-meta">
                        <span className="secnet-zone-name">{zone.zone}</span>
                        <span className="secnet-zone-kind">{NETWORK_ZONE_KIND_LABELS[zone.kind]}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="secnet-cell-text">{zone.connections}</span>
                  </td>
                  <td>
                    <div className="secnet-compliance">
                      <span
                        className={`secnet-compliance-bar secnet-compliance-bar--${zone.status}`}
                        role="img"
                        aria-label={`Compliance ${zone.compliancePct} percent`}
                      >
                        <span style={{ width: `${zone.compliancePct}%` }} />
                      </span>
                      <span className="secnet-compliance-value">{zone.compliancePct}%</span>
                    </div>
                  </td>
                  <td>
                    <ZoneStatusIndicator status={zone.status} />
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}

export default NetworkZonesTable
