/**
 * BrainMint Admin — Device Management
 * Owner: Ishaan Gupta
 * Scope: src/features/admin/pages/DevicesPage.tsx
 *
 * Follows the exact same structural pattern as UsersPage:
 * - Standalone <main> element (no shared PageLayout)
 * - .devices-page  → same pastel-pink/lavender bg + concentric-ring glow
 * - .devices-brand-header  → BrainMint logo + profile stub
 * - .devices-content → page header, summary cards, filter row,
 *                      device inventory table, pagination, floating dock
 *
 * ⚠️ DEVELOPMENT MOCK DATA — the inventory is MOCK_DEVICE_INVENTORY, and
 * this is an administrative monitoring surface only. No device scanning,
 * endpoint verification, security-agent installation, blocking, or
 * enforcement is performed here — those belong to the backend/security engine.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDevicesData, filterDevices } from '../hooks/useDevicesData'
import {
  AdminDeviceRecord,
  DeviceFiltersState,
  DEFAULT_DEVICE_FILTERS,
} from '../types/device.types'
import {
  DEVICE_OS_OPTIONS,
  DEVICE_TYPE_OPTIONS,
} from '../hooks/mockDevicesData'
import { MOCK_EMPLOYEE_DIRECTORY } from '../hooks/mockUsersData'
import { Icon } from '../../../components/ui'
import DevicesTable from '../components/DevicesTable'
import DeviceFilters from '../components/DeviceFilters'
import DeviceDetailsModal from '../components/DeviceDetailsModal'
import './DevicesPage.css'

const PAGE_SIZE = 8

interface SummaryCardDef {
  id: string
  label: string
  value: number
  subtext: string
  iconName: 'monitor' | 'check-circle' | 'alert-triangle' | 'clock'
  tone: 'default' | 'success' | 'danger' | 'warning'
}

/** Employee email → display name map (single source: the users dataset). */
const EMPLOYEE_NAMES: Record<string, string> = Object.fromEntries(
  MOCK_EMPLOYEE_DIRECTORY.map((u) => [u.email, u.fullName]),
)

/** Sorted [email, displayName] pairs for the employee filter dropdown. */
const EMPLOYEE_OPTIONS: Array<[string, string]> = Object.entries(EMPLOYEE_NAMES).sort(
  (a, b) => a[1].localeCompare(b[1]),
)

/** Builds the four summary cards from computed metrics — no hardcoded counts. */
function buildSummaryCards(
  summary: ReturnType<typeof useDevicesData>['summary'],
): SummaryCardDef[] {
  return [
    {
      id: 'd-total',
      label: 'Total Devices',
      value: summary.total,
      subtext: 'Endpoints enrolled in the inventory',
      iconName: 'monitor',
      tone: 'default',
    },
    {
      id: 'd-compliant',
      label: 'Compliant Devices',
      value: summary.compliant,
      subtext: 'Meeting all security baselines',
      iconName: 'check-circle',
      tone: 'success',
    },
    {
      id: 'd-non-compliant',
      label: 'Non-Compliant Devices',
      value: summary.nonCompliant,
      subtext: 'Failing posture requirements',
      iconName: 'alert-triangle',
      tone: 'danger',
    },
    {
      id: 'd-pending',
      label: 'Pending Verification',
      value: summary.pending,
      subtext: 'Awaiting backend security checks',
      iconName: 'clock',
      tone: 'warning',
    },
  ]
}

/** Simple windowed page list with ellipsis handling (shared with UsersPage pattern). */
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

export const DevicesPage: React.FC = () => {
  const { devices, summary, isLoading, lastUpdated, refetch } = useDevicesData()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<DeviceFiltersState>(DEFAULT_DEVICE_FILTERS)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminDeviceRecord | null>(null)

  // 1) Apply all filters together, memoized.
  const filtered = useMemo(() => filterDevices(devices, filters), [devices, filters])

  // 2) Reset pagination whenever the filters (or dataset) change.
  useEffect(() => {
    setPage(1)
  }, [filters, devices])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRecords = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasActiveFilters = useMemo(
    () =>
      filters.search.trim() !== '' ||
      filters.employee !== 'all' ||
      filters.os !== 'all' ||
      filters.deviceType !== 'all' ||
      filters.compliance !== 'all',
    [filters],
  )

  const summaryCards = useMemo(() => buildSummaryCards(summary), [summary])

  return (
    <main className="devices-page">
      <a className="devices-skip-link" href="#devices-content">Skip to main content</a>

      {/* ── Brand header ── */}
      <header className="devices-brand-header">
        <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        <button className="devices-profile-button" type="button" aria-label="Profile">
          <Icon name="user" size={21} />
        </button>
      </header>

      <div className="devices-content" id="devices-content">

        {/* ── Page header ── */}
        <header className="devices-page-header">
          <div>
            <h1>Device Management</h1>
            <p>Monitor registered devices, compliance status, and endpoint security across your organization.</p>
          </div>
          <div className="devices-page-actions">
            <span>Devices: <strong>{summary.total}</strong></span>
            <span title="Development mock data">Development mock data</span>
            <button
              type="button"
              className="devices-refresh"
              onClick={refetch}
              disabled={isLoading}
              aria-label={isLoading ? 'Refreshing device inventory' : 'Refresh device inventory'}
            >
              <Icon name="refresh" size={17} className={isLoading ? 'devices-spin' : ''} />
            </button>
          </div>
        </header>

        {/* ── Summary cards ── */}
        <section className="devices-summary" aria-label="Device inventory overview">
          {summaryCards.map(card => (
            <article
              key={card.id}
              className={`devices-summary-card devices-summary-card--${card.tone}`}
            >
              <div>
                <span className="devices-summary-card__label">{card.label}</span>
                <strong className="devices-summary-card__value" aria-label={`${card.label}: ${card.value}`}>
                  {card.value.toLocaleString()}
                </strong>
                <small className="devices-summary-card__detail">{card.subtext}</small>
              </div>
              <span className="devices-summary-card__icon">
                <Icon name={card.iconName} size={21} />
              </span>
            </article>
          ))}
        </section>

        {/* ── Device inventory card ── */}
        <section className="devices-table-card" aria-label="Device inventory">
          <div className="devices-table-controls">
            <h2 className="devices-table-controls__title">Device Inventory</h2>
            <DeviceFilters
              filters={filters}
              onChange={setFilters}
              employees={EMPLOYEE_OPTIONS}
              osOptions={DEVICE_OS_OPTIONS}
              typeOptions={DEVICE_TYPE_OPTIONS}
              resultCount={filtered.length}
              totalCount={devices.length}
            />
          </div>

          <DevicesTable
            devices={pageRecords}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            employeeNames={EMPLOYEE_NAMES}
            onViewDetails={setSelected}
          />

          {/* ── Pagination ── */}
          <nav className="devices-pagination" aria-label="Device inventory pagination">
            <span className="devices-pagination__meta">
              {filtered.length} of {devices.length} records
              {' · '}Last updated {lastUpdated}
            </span>
            <div className="devices-pagination__controls">
              <button
                type="button"
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              <ol className="devices-pagination__pages">
                {pageList(safePage, totalPages).map((item, i) =>
                  item === 'gap' ? (
                    <li key={`gap-${i}`} className="devices-pagination__gap" aria-hidden="true">…</li>
                  ) : (
                    <li key={item}>
                      <button
                        type="button"
                        className={item === safePage ? 'devices-pagination__page--current' : ''}
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
              </button>
            </div>
          </nav>
        </section>

      </div>

      {/* ── Details modal ── */}
      <DeviceDetailsModal device={selected} employeeNames={EMPLOYEE_NAMES} onClose={() => setSelected(null)} />

      {/* ── Bottom navigation dock ── */}
      <nav className="devices-bottom-nav" aria-label="Primary navigation">
        <button type="button" aria-label="Dashboard" onClick={() => navigate('/admin')}>
          <Icon name="grid" size={22} />
        </button>
        <button type="button" className="devices-bottom-nav__child" aria-current="page" aria-label="Devices">
          <Icon name="monitor" size={22} />
        </button>
        <button type="button" aria-label="Users" onClick={() => navigate('/admin/users')}>
          <Icon name="plus" size={22} />
        </button>
        <button type="button" aria-label="Resources" onClick={() => navigate('/admin/resources')}>
          <Icon name="file-text" size={22} />
        </button>
        {/* Notifications — no route yet; visually present, not interactive */}
        <span className="devices-bottom-nav__visual" aria-hidden="true">
          <Icon name="bell" size={22} />
        </span>
        {/* Profile — no route yet; visually present, not interactive */}
        <span className="devices-bottom-nav__visual" aria-hidden="true">
          <Icon name="user" size={22} />
        </span>
      </nav>
    </main>
  )
}

export default DevicesPage
