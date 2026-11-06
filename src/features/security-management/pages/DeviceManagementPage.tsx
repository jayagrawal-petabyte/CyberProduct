/**
 * BrainMint — Device Management Page (Security Management)
 * Scope: src/features/security-management/pages/DeviceManagementPage.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Implements the approved "Device Management" screen, visually consistent
 * with the other security-management screens (shared .secpol-* page chassis:
 * pastel peach/plum background, brand header, metric cards, toolbar,
 * pagination, modals, FloatingDock).
 * - Page heading, subtitle and "Sync inventory" primary action
 * - Four summary metric cards (derived from the dataset, never hardcoded)
 * - Device inventory: posture tabs, search + platform filter, pagination (6/page)
 * - Inspect details modal with serial/employee/posture/compliance info
 *
 * ⚠️ LOCAL DEVELOPMENT PROTOTYPE — all data is mock. This screen does NOT
 * quarantine devices, remediate endpoints, run assessments, or sync with
 * any MDM. "Sync inventory" only refreshes the mock snapshot; "Remediate"
 * shows an honest local-prototype notice. No real actions are claimed.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../../components/ui'
import SecurityDevicesTable from '../components/SecurityDevicesTable'
import DevicePostureTabs from '../components/DevicePostureTabs'
import SecurityDeviceFilters from '../components/SecurityDeviceFilters'
import SecurityDeviceDetailsModal from '../components/SecurityDeviceDetailsModal'
import {
  useSecurityDevices,
  filterSecurityDevices,
} from '../hooks/useSecurityDevices'
import {
  INVENTORY_SNAPSHOT_DATE,
  SECURITY_DEVICE_OS_OPTIONS,
} from '../data/mockSecurityDevices'
import type {
  DevicePosture,
  SecurityDeviceFiltersState,
  SecurityDeviceRecord,
} from '../types/securityDevice.types'
import { DEFAULT_SECURITY_DEVICE_FILTERS } from '../types/securityDevice.types'
// Shared visual chassis of the security-management module (background,
// header, cards, toolbar, pagination, modal/state styles). Re-used as-is.
import './SecurityPoliciesPage.css'

const PAGE_SIZE = 6

/** Windowed page list with ellipsis handling (shared page pattern). */
function pageList(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set<number>([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: Array<number | 'gap'> = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('gap')
    out.push(p)
    prev = p
  }
  return out
}

/** Zero-pads counts for the non-compliant/quarantined cards ("08"/"02"), per design. */
function formatTwoDigit(value: number): string {
  return String(value).padStart(2, '0')
}

export const DeviceManagementPage: React.FC = () => {
  const {
    devices,
    summary,
    isLoading,
    lastUpdated,
    refetch,
  } = useSecurityDevices()

  const [filters, setFilters] = useState<SecurityDeviceFiltersState>(
    DEFAULT_SECURITY_DEVICE_FILTERS,
  )
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SecurityDeviceRecord | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Apply all filters (search + platform + posture tab) together, memoized.
  const filtered = useMemo(
    () => filterSecurityDevices(devices, filters),
    [devices, filters],
  )

  // Reset pagination when filters or dataset change.
  useEffect(() => {
    setPage(1)
  }, [filters, devices])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRecords = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.os !== 'all' ||
    filters.posture !== 'all'

  /** Posture tab counts derived from the FULL dataset, not the filtered view. */
  const postureCounts: Record<DevicePosture, number> = {
    compliant: summary.compliant,
    'non-compliant': summary.nonCompliant,
    quarantined: summary.quarantined,
  }

  /**
   * HONEST LOCAL PROTOTYPE — re-serves the static mock snapshot only.
   * No MDM sync of any kind is performed, and none is claimed.
   */
  const handleSyncInventory = () => {
    refetch()
    setFeedback(
      'Mock inventory refreshed — local prototype only: no MDM sync was performed; device inventory sync runs on the MDM backend.',
    )
  }

  /**
   * HONEST LOCAL PROTOTYPE — displays a notice only. No remediation is
   * performed on any endpoint, and no action is claimed.
   */
  const handleRemediate = (device: SecurityDeviceRecord) => {
    setSelected(null)
    setFeedback(
      `Local prototype only: remediation not performed for "${device.deviceName}" (${device.deviceId}) — endpoint remediation runs on the MDM backend.`,
    )
  }

    return (
    <main className="secpol-page">
      <a className="secpol-skip-link" href="#secpol-content">Skip to main content</a>
      <span className="secpol-accent-dot" aria-hidden="true" />

      {/* ── Brand header (same as the other security screens) ── */}
      <header className="secpol-brand-header">
        <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        <button className="secpol-profile-button" type="button" aria-label="Profile">
          <Icon name="user" size={21} />
        </button>
      </header>

      <div className="secpol-content" id="secpol-content">

        {/* ── Page header (same typography as the other security screens) ── */}
        <header className="secpol-page-header">
          <div>
            <h1>Device Management</h1>
            <p>Monitor managed endpoints, investigate posture issues, and enforce device trust.</p>
          </div>
          <div className="secpol-page-actions">
            <span title="All data on this screen is development mock data">Development mock data</span>
            <button
              type="button"
              className="secpol-btn-primary"
              onClick={handleSyncInventory}
              disabled={isLoading}
              aria-label="Sync inventory (local prototype — no MDM sync)"
            >
              <Icon name="refresh" size={13} />
              Sync inventory
            </button>
          </div>
        </header>

        {/* ── Feedback toast (honest local-prototype confirmations) ── */}
        {feedback && (
          <div className="secpol-feedback" role="status">
            <Icon name="check-circle" size={15} />
            <span>{feedback}</span>
          </div>
        )}

        {/* ── Summary metric cards (derived from the dataset) ── */}
        <section className="secpol-summary" aria-label="Device inventory overview">
          <article className="secpol-metric">
            <span className="secpol-metric-label">Managed devices</span>
            <strong className="secpol-metric-value" aria-label={`Managed devices: ${summary.total}`}>
              {summary.total}
            </strong>
            <small className="secpol-metric-sub">Across all platforms</small>
          </article>

          <article className="secpol-metric">
            <span className="secpol-metric-label">Compliant</span>
            <strong className="secpol-metric-value" aria-label={`Compliant devices: ${summary.compliant}`}>
              {summary.compliant}
            </strong>
            <small className="secpol-metric-sub secpol-metric-sub--success">
              Meeting every posture check
            </small>
          </article>

          <article className="secpol-metric">
            <span className="secpol-metric-label">Non-compliant</span>
            <strong className="secpol-metric-value" aria-label={`Non-compliant devices: ${formatTwoDigit(summary.nonCompliant)}`}>
              {formatTwoDigit(summary.nonCompliant)}
            </strong>
            <small className="secpol-metric-sub secpol-metric-sub--warning">
              Open posture issues to resolve
            </small>
          </article>

          <article className="secpol-metric">
            <span className="secpol-metric-label">Quarantined</span>
            <strong className="secpol-metric-value" aria-label={`Quarantined devices: ${formatTwoDigit(summary.quarantined)}`}>
              {formatTwoDigit(summary.quarantined)}
            </strong>
            <small className="secpol-metric-sub">Awaiting trust reinstatement</small>
          </article>
        </section>

        {/* ── Endpoint inventory card ── */}
        <section className="secpol-library" aria-label="Device inventory">
          <div className="secpol-library-head">
            <h2 className="secpol-library-title">Endpoint inventory</h2>
            <p className="secpol-library-sub">
              Managed endpoints assessed in the mock snapshot
              {' · '}Mock refreshed {lastUpdated}
            </p>
          </div>

          {/* Posture tabs (counts derived from the full dataset) */}
          <DevicePostureTabs
            value={filters.posture}
            onChange={(posture) => setFilters((prev) => ({ ...prev, posture }))}
            counts={postureCounts}
            totalDevices={devices.length}
            isLoading={isLoading}
          />

          <div className="secpol-toolbar">
            <SecurityDeviceFilters
              filters={filters}
              onChange={setFilters}
              platforms={SECURITY_DEVICE_OS_OPTIONS}
              resultCount={filtered.length}
              totalCount={devices.length}
              snapshotDate={INVENTORY_SNAPSHOT_DATE}
            />
          </div>

          <SecurityDevicesTable
            devices={pageRecords}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onInspect={setSelected}
            onRemediate={handleRemediate}
          />

          {/* ── Pagination ── */}
          <nav className="secpol-pagination" aria-label="Device inventory pagination">
            <span className="secpol-pagination__meta">
              Showing {pageRecords.length} of {filtered.length} devices
              {hasActiveFilters ? ` (filtered from ${devices.length})` : ''}
            </span>
            <div className="secpol-pagination__controls">
              <button
                type="button"
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                <Icon name="chevron-left" size={13} />
                Previous
              </button>
              <ol className="secpol-pagination__pages">
                {pageList(safePage, totalPages).map((item, i) =>
                  item === 'gap' ? (
                    <li key={`gap-${i}`} className="secpol-pagination__gap" aria-hidden="true">…</li>
                  ) : (
                    <li key={item}>
                      <button
                        type="button"
                        className={item === safePage ? 'secpol-pagination__page--current' : ''}
                        onClick={() => setPage(item)}
                        aria-label={`Page ${item}`}
                        aria-current={item === safePage ? 'page' : undefined}
                      >
                        {item}
                      </button>
                    </li>
                  ),
                )}
              </ol>
              <button
                type="button"
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages}
                aria-label="Next page"
              >
                Next
                <Icon name="arrow-right" size={13} />
              </button>
            </div>
          </nav>
        </section>

      </div>

      {/* ── Inspection modal ── */}
      <SecurityDeviceDetailsModal
        device={selected}
        onClose={() => setSelected(null)}
        onRemediate={handleRemediate}
      />
    </main>
  )
}

export default DeviceManagementPage
