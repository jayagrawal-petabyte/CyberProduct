/**
 * BrainMint — Network Compliance Page
 * Scope: src/features/security-management/pages/NetworkCompliancePage.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Implements the approved "Network Compliance" screen, visually consistent
 * with Security Policies and Restricted Resources (shared .secpol-* page
 * chassis: pastel peach/plum background, brand header, metric cards,
 * toolbar, pagination, FloatingDock).
 * - Page heading, subtitle and "Run assessment" primary action
 * - Four summary metric cards (derived from the zone dataset)
 * - Monitored Network Zones table: search + status filter, pagination (6/page)
 * - Two-column lower section: Control Health + Recent Enforcement
 *
 * ⚠️ LOCAL DEVELOPMENT PROTOTYPE — all data is mock. This screen does NOT
 * scan networks, enforce VPN rules, block connections, or remediate
 * anything. "Run assessment" is an honest local-prototype affordance that
 * only refreshes the mock snapshot; no real assessment is ever performed.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../../components/ui'
import NetworkZonesTable from '../components/NetworkZonesTable'
import NetworkZoneFilters from '../components/NetworkZoneFilters'
import ControlHealthPanel from '../components/ControlHealthPanel'
import RecentEnforcementPanel from '../components/RecentEnforcementPanel'
import {
  useNetworkCompliance,
  filterNetworkZones,
} from '../hooks/useNetworkCompliance'
import {
  COMPLIANCE_SNAPSHOT_DATE,
  NETWORK_ZONE_STATUS_OPTIONS,
} from '../data/mockNetworkCompliance'
import type { ComplianceSummary, NetworkZoneFiltersState } from '../types/networkCompliance.types'
import { DEFAULT_NETWORK_ZONE_FILTERS } from '../types/networkCompliance.types'
// Shared visual chassis of the security-management module (background,
// header, cards, toolbar, pagination, state panels). Re-used as-is;
// panel/progress/event styles live in NetworkCompliancePanels.css.
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

export const NetworkCompliancePage: React.FC = () => {
  const {
    zones,
    controls,
    events,
    summary,
    isLoading,
    lastUpdated,
    refetch,
  } = useNetworkCompliance()

  const [filters, setFilters] = useState<NetworkZoneFiltersState>(DEFAULT_NETWORK_ZONE_FILTERS)
  const [page, setPage] = useState(1)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Apply filters together, memoized.
  const filtered = useMemo(
    () => filterNetworkZones(zones, filters),
    [zones, filters],
  )

  // Reset pagination when filters or dataset change.
  useEffect(() => {
    setPage(1)
  }, [filters, zones])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageZones = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'all'

  /**
   * HONEST LOCAL PROTOTYPE — re-serves the static mock snapshot only.
   * No network scan, VPN enforcement, connection blocking, or remediation
   * of any kind is performed, and no real assessment is claimed.
   */
  const handleRunAssessment = () => {
    refetch()
    setFeedback(
      'Mock snapshot refreshed — local prototype only: no assessment was performed; network compliance evaluation runs on the backend.',
    )
  }

  /** Zero-pads the zone count for the "Networks monitored" card ("08"), per design. */
  const metricCards = buildMetricCards(summary)

  return (
    <main className="secpol-page">
      <a className="secpol-skip-link" href="#secpol-content">Skip to main content</a>
      <span className="secpol-accent-dot" aria-hidden="true" />

      {/* ── Brand header (same as Security Policies / Admin Dashboard) ── */}
      <header className="secpol-brand-header">
        <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        <button className="secpol-profile-button" type="button" aria-label="Profile">
          <Icon name="user" size={21} />
        </button>
      </header>

      <div className="secpol-content" id="secpol-content">

        {/* ── Page header (same typography as Security Policies) ── */}
        <header className="secpol-page-header">
          <div>
            <h1>Network Compliance</h1>
            <p>Assess network trust and enforce secure connections to company resources.</p>
          </div>
          <div className="secpol-page-actions">
            <span title="All data on this screen is development mock data">Development mock data</span>
            <button
              type="button"
              className="secpol-btn-primary"
              onClick={handleRunAssessment}
              disabled={isLoading}
              aria-label="Run assessment (local prototype — no real assessment)"
            >
              <Icon name="refresh" size={13} />
              Run assessment
            </button>
          </div>
        </header>

        {/* ── Feedback toast (honest local-prototype confirmation) ── */}
        {feedback && (
          <div className="secpol-feedback" role="status">
            <Icon name="shield-check" size={15} />
            <span>{feedback}</span>
          </div>
        )}

        {/* ── Summary metric cards (derived from the zone dataset) ── */}
        <section className="secpol-summary" aria-label="Network compliance overview">
          {metricCards.map((card) => (
            <article key={card.id} className="secpol-metric">
              <span className="secpol-metric-label">{card.label}</span>
              <strong
                className="secpol-metric-value"
                aria-label={`${card.label}: ${card.value}`}
              >
                {card.value}
              </strong>
              <small className={`secpol-metric-sub${card.tone ? ` secpol-metric-sub--${card.tone}` : ''}`}>
                {card.sub}
              </small>
            </article>
          ))}
        </section>

        {/* ── Monitored network zones card ── */}
        <section className="secpol-library" aria-label="Monitored network zones">
          <div className="secpol-library-head">
            <h2 className="secpol-library-title">Monitored network zones</h2>
            <p className="secpol-library-sub">
              Zones assessed for compliance in the mock snapshot
              {' · '}Mock refreshed {lastUpdated}
            </p>
          </div>

          <div className="secpol-toolbar">
            <NetworkZoneFilters
              filters={filters}
              onChange={setFilters}
              statuses={[...NETWORK_ZONE_STATUS_OPTIONS]}
              resultCount={filtered.length}
              totalCount={zones.length}
              snapshotDate={COMPLIANCE_SNAPSHOT_DATE}
            />
          </div>

          <NetworkZonesTable
            zones={pageZones}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
          />

          {/* ── Pagination ── */}
          <nav className="secpol-pagination" aria-label="Network zones pagination">
            <span className="secpol-pagination__meta">
              Showing {pageZones.length} of {filtered.length} zones
              {hasActiveFilters ? ` (filtered from ${zones.length})` : ''}
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

        {/* ── Two-column lower section: Control Health + Recent Enforcement ── */}
        <div className="secnet-panels">
          <ControlHealthPanel controls={controls} />
          <RecentEnforcementPanel events={events} />
        </div>

      </div>
    </main>
  )
}

interface MetricCard {
  id: string
  label: string
  value: string
  sub: string
  tone?: 'success' | 'danger' | 'warning'
}

/** Builds the four summary cards from computed metrics — no hardcoded counts. */
function buildMetricCards(summary: ComplianceSummary): MetricCard[] {
  return [
    {
      id: 'nc-score',
      label: 'Compliance score',
      value: `${summary.complianceScorePct}%`,
      sub: 'Connection-weighted across zones',
    },
    {
      id: 'nc-trusted',
      label: 'Trusted connections',
      value: String(summary.trustedConnections),
      sub: `Of ${summary.totalConnections} total connections`,
      tone: 'success',
    },
    {
      id: 'nc-blocked',
      label: 'Blocked connections',
      value: String(summary.blockedConnections),
      sub: 'Restricted and untrusted zones',
      tone: 'danger',
    },
    {
      id: 'nc-zones',
      label: 'Networks monitored',
      value: formatZoneCountFor(summary.zonesMonitored),
      sub: 'Across all network types',
    },
  ]
}

/** Zero-pads small counts ("08"), consistent with the approved design. */
function formatZoneCountFor(value: number): string {
  return String(value).padStart(2, '0')
}

export default NetworkCompliancePage
