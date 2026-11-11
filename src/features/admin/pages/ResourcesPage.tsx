/**
 * BrainMint Admin — Resource Management
 * Owner: Ishaan Gupta
 * Scope: src/features/admin/pages/ResourcesPage.tsx
 *
 * Follows the exact same structural pattern as DevicesPage/UsersPage:
 * - Standalone <main> element (no shared PageLayout)
 * - .resources-page  → same pastel-pink/lavender bg + concentric-ring glow
 * - .resources-brand-header  → BrainMint logo + profile stub
 * - .resources-content → page header, summary cards, filter row,
 *                        resource table, pagination, floating dock
 *
 * ⚠️ DEVELOPMENT MOCK DATA — the directory is MOCK_RESOURCE_DIRECTORY, and
 * this is an administrative directory surface only. No resource blocking,
 * permission enforcement, access provisioning, or policy decisions are
 * performed here — no create/edit/delete operations either, as no such
 * backend workflow exists yet.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useResourcesData, filterResources } from '../hooks/useResourcesData'
import {
  AdminResourceRecord,
  ResourceFiltersState,
  DEFAULT_RESOURCE_FILTERS,
} from '../types/resource.types'
import {
  RESOURCE_CATEGORY_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
  RESOURCE_ACCESS_OPTIONS,
  RESOURCE_STATUS_OPTIONS,
} from '../hooks/mockResourcesData'
import { Icon } from '../../../components/ui'
import ResourcesTable from '../components/ResourcesTable'
import ResourceFilters from '../components/ResourceFilters'
import ResourceDetailsModal from '../components/ResourceDetailsModal'
import './ResourcesPage.css'

const PAGE_SIZE = 8

interface SummaryCardDef {
  id: string
  label: string
  value: number
  subtext: string
  iconName: 'shield' | 'check-circle' | 'alert-triangle' | 'clock'
  tone: 'default' | 'success' | 'danger' | 'warning'
}

/** Builds the four summary cards from computed metrics — no hardcoded counts. */
function buildSummaryCards(
  summary: ReturnType<typeof useResourcesData>['summary'],
): SummaryCardDef[] {
  return [
    {
      id: 'r-total',
      label: 'Total Resources',
      value: summary.total,
      subtext: 'Records in the directory',
      iconName: 'shield',
      tone: 'default',
    },
    {
      id: 'r-active',
      label: 'Active Resources',
      value: summary.active,
      subtext: 'Available for normal access',
      iconName: 'check-circle',
      tone: 'success',
    },
    {
      id: 'r-restricted',
      label: 'Restricted Resources',
      value: summary.restricted,
      subtext: 'Access currently limited',
      iconName: 'alert-triangle',
      tone: 'danger',
    },
    {
      id: 'r-pending',
      label: 'Pending Review',
      value: summary.pending,
      subtext: 'Awaiting classification sign-off',
      iconName: 'clock',
      tone: 'warning',
    },
  ]
}

/** Simple windowed page list with ellipsis handling (shared page pattern). */
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

export const ResourcesPage: React.FC = () => {
  const { resources, summary, isLoading, lastUpdated, refetch } = useResourcesData()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ResourceFiltersState>(DEFAULT_RESOURCE_FILTERS)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminResourceRecord | null>(null)

  // 1) Apply all filters together, memoized.
  const filtered = useMemo(() => filterResources(resources, filters), [resources, filters])

  // 2) Reset pagination whenever the filters (or dataset) change.
  useEffect(() => {
    setPage(1)
  }, [filters, resources])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRecords = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasActiveFilters = useMemo(
    () =>
      filters.search.trim() !== '' ||
      filters.category !== 'all' ||
      filters.type !== 'all' ||
      filters.access !== 'all' ||
      filters.status !== 'all' ||
      filters.department !== 'all',
    [filters],
  )

  const departmentOptions = useMemo(
    () =>
      Array.from(new Set(resources.map((r) => r.ownerDepartment))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [resources],
  )

  // Derived summary cards from computed metrics.
  const summaryCards = useMemo(() => buildSummaryCards(summary), [summary])

  return (
    <main className="resources-page">
      <a className="resources-skip-link" href="#resources-content">Skip to main content</a>

      {/* ── Brand header ── */}
      <header className="resources-brand-header">
        <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        <button className="resources-profile-button" type="button" aria-label="Profile">
          <Icon name="user" size={21} />
        </button>
      </header>

      <div className="resources-content" id="resources-content">

        {/* ── Page header ── */}
        <header className="resources-page-header">
          <div>
            <h1>Resource Management</h1>
            <p>Manage organizational resources, applications, websites, and access availability.</p>
          </div>
          <div className="resources-page-actions">
            <span>Resources: <strong>{summary.total}</strong></span>
            <span title="Development mock data">Development mock data</span>
            <button
              type="button"
              className="resources-refresh"
              onClick={refetch}
              disabled={isLoading}
              aria-label={isLoading ? 'Refreshing resource directory' : 'Refresh resource directory'}
            >
              <Icon name="refresh" size={17} className={isLoading ? 'resources-spin' : ''} />
            </button>
          </div>
        </header>

        {/* ── Summary cards ── */}
        <section className="resources-summary" aria-label="Resource overview">
          {summaryCards.map(card => (
            <article
              key={card.id}
              className={`resources-summary-card resources-summary-card--${card.tone}`}
            >
              <div>
                <span className="resources-summary-card__label">{card.label}</span>
                <strong className="resources-summary-card__value" aria-label={`${card.label}: ${card.value}`}>
                  {card.value.toLocaleString()}
                </strong>
                <small className="resources-summary-card__detail">{card.subtext}</small>
              </div>
              <span className="resources-summary-card__icon">
                <Icon name={card.iconName} size={21} />
              </span>
            </article>
          ))}
        </section>

        {/* ── Resource directory card ── */}
        <section className="resources-table-card" aria-label="Resource directory">
          <div className="resources-table-controls">
            <h2 className="resources-table-controls__title">Resource Directory</h2>
            <ResourceFilters
              filters={filters}
              onChange={setFilters}
              categories={RESOURCE_CATEGORY_OPTIONS}
              types={RESOURCE_TYPE_OPTIONS}
              accessLevels={RESOURCE_ACCESS_OPTIONS}
              statuses={RESOURCE_STATUS_OPTIONS}
              departments={departmentOptions}
              resultCount={filtered.length}
              totalCount={resources.length}
            />
          </div>

          <ResourcesTable
            resources={pageRecords}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onViewDetails={setSelected}
          />

          {/* ── Pagination ── */}
          <nav className="resources-pagination" aria-label="Resource directory pagination">
            <span className="resources-pagination__meta">
              {filtered.length} of {resources.length} records
              {' · '}Last updated {lastUpdated}
            </span>
            <div className="resources-pagination__controls">
              <button
                type="button"
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              <ol className="resources-pagination__pages">
                {pageList(safePage, totalPages).map((item, i) =>
                  item === 'gap' ? (
                    <li key={`gap-${i}`} className="resources-pagination__gap" aria-hidden="true">…</li>
                  ) : (
                    <li key={item}>
                      <button
                        type="button"
                        className={item === safePage ? 'resources-pagination__page--current' : ''}
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
      <ResourceDetailsModal resource={selected} onClose={() => setSelected(null)} />

      {/* ── Bottom navigation dock ── */}
      <nav className="resources-bottom-nav" aria-label="Primary navigation">
        <button type="button" aria-label="Dashboard" onClick={() => navigate('/admin')}>
          <Icon name="grid" size={22} />
        </button>
        <button type="button" aria-label="Devices" onClick={() => navigate('/admin/devices')}>
          <Icon name="monitor" size={22} />
        </button>
        <button type="button" aria-label="Users" onClick={() => navigate('/admin/users')}>
          <Icon name="plus" size={22} />
        </button>
        <button type="button" className="resources-bottom-nav__child" aria-current="page" aria-label="Resources">
          <Icon name="file-text" size={22} />
        </button>
        {/* Notifications — no route yet; visually present, not interactive */}
        <span className="resources-bottom-nav__visual" aria-hidden="true">
          <Icon name="bell" size={22} />
        </span>
        {/* Profile — no route yet; visually present, not interactive */}
        <span className="resources-bottom-nav__visual" aria-hidden="true">
          <Icon name="user" size={22} />
        </span>
      </nav>
    </main>
  )
}

export default ResourcesPage
