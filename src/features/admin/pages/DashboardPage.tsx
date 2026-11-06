/**
 * BrainMint Security Admin Dashboard
 * Owner: Ishaan Gupta
 * Scope: src/features/admin/pages/DashboardPage.tsx
 *
 * Follows the exact same structural pattern as ApprovalInboxPage:
 * - Standalone <main> element (no shared PageLayout)
 * - .admin-page  → same pastel-pink/lavender bg + concentric-ring glow
 * - .admin-brand-header  → BrainMint logo + profile stub
 * - .admin-content → page header, KPI summary cards, monitoring grid,
 *                    activity table, floating dock
 */

import React, { useMemo, useState } from 'react'
import { useDashboardData } from '../hooks/useDashboardData'
import './DashboardPage.css'

/* ─── inline SVG icons (subset matching approvals ApprovalIcon) ─── */
interface AdminIconProps {
  name:
    | 'grid' | 'monitor' | 'plus' | 'clipboard' | 'bell' | 'user'
    | 'shield-check' | 'clock' | 'alert-triangle' | 'lock'
    | 'check-circle' | 'search' | 'refresh'
  size?: number
  className?: string
}

const AdminIcon: React.FC<AdminIconProps> = ({ name, size = 20, className }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const, 'aria-hidden': true,
    ...(className ? { className } : {}) }
  switch (name) {
    case 'grid':           return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    case 'monitor':        return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
    case 'plus':           return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    case 'clipboard':      return <svg {...p}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
    case 'bell':           return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    case 'user':           return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'shield-check':   return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
    case 'clock':          return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    case 'alert-triangle': return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    case 'lock':           return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    case 'check-circle':   return <svg {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    case 'search':         return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    case 'refresh':        return <svg {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
    default:               return null
  }
}

/* ─── helpers ─────────────────────────────────────────────── */
function avatarClass(idx: number): string {
  return `admin-avatar admin-avatar--${(idx % 5) + 1}`
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

/* ─── Component ───────────────────────────────────────────── */
export const DashboardPage: React.FC = () => {
  const { data, isLoading, refetch } = useDashboardData()

  // Activity table local state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')

  const activities = data?.recentActivities ?? []

  const filtered = useMemo(() => {
    return activities.filter(a => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        a.actorName.toLowerCase().includes(q) ||
        a.eventType.toLowerCase().includes(q) ||
        a.targetResource.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter
      const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter
      return matchesSearch && matchesStatus && matchesSeverity
    })
  }, [activities, search, statusFilter, severityFilter])

  const kpis = data?.kpis ?? []
  const net = data?.networkCompliance
  const dev = data?.devicePosture
  const acc = data?.accessDemand
  const pol = data?.policyViolations

  return (
    <main className="admin-page">
      <a className="admin-skip-link" href="#admin-content">Skip to main content</a>

      {/* ── Brand header ── */}
      <header className="admin-brand-header">
        <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        <button className="admin-profile-button" type="button" aria-label="Profile">
          <AdminIcon name="user" size={21} />
        </button>
      </header>

      <div className="admin-content" id="admin-content">

        {/* ── Page header ── */}
        <header className="admin-page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Enterprise security, access control and compliance overview.</p>
          </div>
          <div className="admin-page-actions">
            <span title="Development mock data">Development mock data</span>
            <button
              type="button"
              className="admin-refresh"
              onClick={refetch}
              disabled={isLoading}
              aria-label={isLoading ? 'Refreshing dashboard' : 'Refresh dashboard'}
            >
              <AdminIcon name="refresh" size={17} className={isLoading ? 'admin-spin' : ''} />
            </button>
          </div>
        </header>

        {/* ── KPI summary cards ── */}
        <section className="admin-summary" aria-label="Key security indicators">
          {kpis.map(kpi => (
            <article
              key={kpi.id}
              className={`admin-summary-card admin-summary-card--${kpi.tone ?? 'default'}`}
            >
              <div>
                <span className="admin-summary-card__label">{kpi.title}</span>
                <strong className="admin-summary-card__value" aria-label={`${kpi.title}: ${kpi.value}`}>
                  {kpi.value}
                </strong>
                <small className="admin-summary-card__detail">{kpi.subtext}</small>
              </div>
              <span className="admin-summary-card__icon">
                <AdminIcon name={kpi.iconName as AdminIconProps['name']} size={21} />
              </span>
            </article>
          ))}
        </section>

        {/* ── Monitoring 2-column grid ── */}
        {net && dev && acc && pol && (
          <section className="admin-monitoring-grid" aria-label="Operational monitoring">

            {/* Network Compliance */}
            <div className="admin-section-card">
              <div className="admin-section-card__header">
                <div className="admin-section-card__title-group">
                  <span className="admin-section-card__icon-bubble admin-section-card__icon-bubble--blue">
                    <AdminIcon name="shield-check" size={16} />
                  </span>
                  <div>
                    <h2 className="admin-section-card__title">Network Compliance</h2>
                    <p className="admin-section-card__subtitle">Zero-trust gateways &amp; VPC subnets</p>
                  </div>
                </div>
                <span className="admin-count-pill">{net.complianceScore}% Enforced</span>
              </div>
              <div className="admin-section-card__body">
                <div className="admin-progress-block">
                  <div className="admin-progress-label-row">
                    <span>Gateway TLS &amp; Tunnel Health</span>
                    <span className="admin-progress-value">{net.gatewayTlsPercent}%</span>
                  </div>
                  <div className="admin-progress-track">
                    <div className="admin-progress-fill" style={{ width: `${net.gatewayTlsPercent}%` }} />
                  </div>
                </div>

                <div className="admin-stat-pills-row">
                  <div className="admin-stat-pill">
                    <span className="admin-stat-pill__num">{net.activeGateways} / {net.totalGateways}</span>
                    <span className="admin-stat-pill__label">Gateways Active</span>
                  </div>
                  <div className="admin-stat-pill">
                    <span className="admin-stat-pill__num">{net.isolatedSubnets}</span>
                    <span className="admin-stat-pill__label">Isolated Subnets</span>
                  </div>
                </div>

                <div className="admin-breakdown-list">
                  {net.gateways.map((gw, i) => (
                    <div key={i} className="admin-breakdown-row">
                      <div className="admin-breakdown-row__left">
                        <span className={`admin-dot ${gw.status === 'compliant' ? 'admin-dot--green' : 'admin-dot--amber'}`} />
                        <span className="admin-breakdown-row__name">{gw.name}</span>
                      </div>
                      <div className="admin-breakdown-row__right">
                        <span className="admin-breakdown-row__pct">{gw.compliancePercent}%</span>
                        <span className="admin-breakdown-row__count">({gw.activeGateways} nodes)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Device Compliance */}
            <div className="admin-section-card">
              <div className="admin-section-card__header">
                <div className="admin-section-card__title-group">
                  <span className="admin-section-card__icon-bubble admin-section-card__icon-bubble--purple">
                    <AdminIcon name="monitor" size={16} />
                  </span>
                  <div>
                    <h2 className="admin-section-card__title">Device Compliance</h2>
                    <p className="admin-section-card__subtitle">Endpoint EDR, encryption &amp; posture</p>
                  </div>
                </div>
                <span className="admin-count-pill">{dev.totalDevices.toLocaleString()} Devices</span>
              </div>
              <div className="admin-section-card__body">
                <div className="admin-meter-bar">
                  <div
                    className="admin-meter-segment admin-meter-segment--green"
                    style={{ width: `${(dev.compliantCount / dev.totalDevices) * 100}%` }}
                    title={`Compliant: ${dev.compliantCount}`}
                  />
                  <div
                    className="admin-meter-segment admin-meter-segment--amber"
                    style={{ width: `${(dev.pendingCount / dev.totalDevices) * 100}%` }}
                    title={`Pending: ${dev.pendingCount}`}
                  />
                  <div
                    className="admin-meter-segment admin-meter-segment--red"
                    style={{ width: `${(dev.criticalCount / dev.totalDevices) * 100}%` }}
                    title={`Critical: ${dev.criticalCount}`}
                  />
                </div>
                <div className="admin-meter-legend">
                  <div className="admin-meter-legend__item"><span className="admin-swatch admin-swatch--green" />Compliant ({dev.compliantCount})</div>
                  <div className="admin-meter-legend__item"><span className="admin-swatch admin-swatch--amber" />Pending ({dev.pendingCount})</div>
                  <div className="admin-meter-legend__item"><span className="admin-swatch admin-swatch--red" />Critical ({dev.criticalCount})</div>
                </div>
                <div className="admin-breakdown-list">
                  {dev.osList.map((os, i) => (
                    <div key={i} className="admin-breakdown-row">
                      <span className="admin-breakdown-row__name">{os.osName}</span>
                      <div className="admin-breakdown-row__right">
                        <span className="admin-breakdown-row__pct">{os.compliancePercent}%</span>
                        <span className="admin-breakdown-row__count">({os.deviceCount})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Access Requests */}
            <div className="admin-section-card">
              <div className="admin-section-card__header">
                <div className="admin-section-card__title-group">
                  <span className="admin-section-card__icon-bubble admin-section-card__icon-bubble--amber">
                    <AdminIcon name="clock" size={16} />
                  </span>
                  <div>
                    <h2 className="admin-section-card__title">Access Requests</h2>
                    <p className="admin-section-card__subtitle">Elevated permissions &amp; approvals</p>
                  </div>
                </div>
                <span className="admin-count-pill">{acc.pendingReviewCount} Pending</span>
              </div>
              <div className="admin-section-card__body">
                <div className="admin-stat-pills-row">
                  <div className="admin-stat-pill">
                    <span className="admin-stat-pill__num admin-stat-pill__num--amber">{acc.pendingReviewCount}</span>
                    <span className="admin-stat-pill__label">Pending Lead</span>
                  </div>
                  <div className="admin-stat-pill">
                    <span className="admin-stat-pill__num">{acc.autoApprovedTodayCount}</span>
                    <span className="admin-stat-pill__label">Auto-Approved Today</span>
                  </div>
                  <div className="admin-stat-pill">
                    <span className="admin-stat-pill__num">{acc.avgResponseTimeHours}h</span>
                    <span className="admin-stat-pill__label">Avg Turnaround</span>
                  </div>
                </div>
                <span className="admin-section-caption">High-Demand Resource Classes</span>
                <div className="admin-breakdown-list">
                  {acc.resourceClasses.map((rc, i) => (
                    <div key={i} className="admin-breakdown-row">
                      <span className="admin-breakdown-row__name">{rc.category}</span>
                      <span className="admin-count-pill">{rc.activeRequests} requests</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Policy Violations */}
            <div className="admin-section-card">
              <div className="admin-section-card__header">
                <div className="admin-section-card__title-group">
                  <span className="admin-section-card__icon-bubble admin-section-card__icon-bubble--red">
                    <AdminIcon name="alert-triangle" size={16} />
                  </span>
                  <div>
                    <h2 className="admin-section-card__title">Policy Violations</h2>
                    <p className="admin-section-card__subtitle">Zero-trust rule breaches (24h)</p>
                  </div>
                </div>
                <span className="admin-count-pill">
                  {pol.criticalCount + pol.highCount + pol.mediumCount + pol.lowCount} Total
                </span>
              </div>
              <div className="admin-section-card__body">
                <div className="admin-severity-grid">
                  <div className="admin-severity-box admin-severity-box--crit">
                    <span className="admin-severity-num">{pol.criticalCount}</span>
                    <span className="admin-severity-label">Critical</span>
                  </div>
                  <div className="admin-severity-box admin-severity-box--high">
                    <span className="admin-severity-num">{pol.highCount}</span>
                    <span className="admin-severity-label">High</span>
                  </div>
                  <div className="admin-severity-box admin-severity-box--med">
                    <span className="admin-severity-num">{pol.mediumCount}</span>
                    <span className="admin-severity-label">Medium</span>
                  </div>
                  <div className="admin-severity-box admin-severity-box--low">
                    <span className="admin-severity-num">{pol.lowCount}</span>
                    <span className="admin-severity-label">Low</span>
                  </div>
                </div>
                <div className="admin-callout-card">
                  <span className="admin-callout-tag">Top Trigger:</span>
                  <span className="admin-callout-text">{pol.topTriggerPolicy}</span>
                </div>
              </div>
            </div>

          </section>
        )}

        {/* ── Recent Activity Table ── */}
        <section className="admin-table-card" aria-label="Recent security activity">
          <div className="admin-table-controls">
            <h2 className="admin-table-controls__title">Recent Security Activity</h2>
            <div className="admin-table-controls__right">
              {/* Search */}
              <div className="admin-search-wrap">
                <AdminIcon name="search" size={15} />
                <input
                  type="search"
                  className="admin-search-input"
                  placeholder="Search events, actors…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search activity"
                />
              </div>
              <span className="admin-filter-divider" aria-hidden="true" />
              {/* Status filter */}
              <select
                className="admin-filter-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="compliant">Compliant</option>
                <option value="rejected">Blocked / Quarantined</option>
              </select>
              <span className="admin-filter-divider" aria-hidden="true" />
              {/* Severity filter */}
              <select
                className="admin-filter-select"
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                aria-label="Filter by severity"
              >
                <option value="all">All severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Actor</th>
                  <th>Event</th>
                  <th>Target Resource</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>IP Address</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="admin-state" role="status">
                        <AdminIcon name="search" size={30} />
                        <h2>No events match these filters</h2>
                        <p>Try a different search or filter combination.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {filtered.map((a, idx) => (
                  <tr key={a.id}>
                    <td>
                      <div className="admin-actor-cell">
                        <span className={avatarClass(idx)} aria-hidden="true">
                          {initials(a.actorName)}
                        </span>
                        <div>
                          <div className="admin-actor-name">{a.actorName}</div>
                          <div className="admin-actor-email">{a.actorEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-event-type">{a.eventType}</span>
                      <span className="admin-action-detail">{a.actionDetails}</span>
                    </td>
                    <td>
                      <div className="admin-resource-cell">
                        <span className="admin-resource-name">{a.targetResource}</span>
                        <span className="admin-resource-category">{a.resourceCategory}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-tag admin-tag--${a.severity}`}>
                        {a.severity.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <StatusPill status={a.status} label={a.statusLabel} />
                    </td>
                    <td>
                      <span className="admin-timestamp" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.71rem' }}>
                        {a.ipAddress}
                      </span>
                    </td>
                    <td>
                      <span className="admin-timestamp">{a.timestamp}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-table-footer">
            <span>{filtered.length} of {activities.length} events</span>
            <span className="admin-table-footer__note">Last updated {data?.lastUpdated ?? '—'}</span>
          </div>
        </section>

      </div>

      {/* ── Bottom navigation dock ── */}
      <nav className="admin-bottom-nav" aria-label="Primary navigation">
        <button type="button" className="admin-bottom-nav__active" aria-current="page" aria-label="Dashboard">
          <AdminIcon name="grid" size={22} />
        </button>
        <button type="button" disabled aria-label="Devices (not available yet)">
          <AdminIcon name="monitor" size={22} />
        </button>
        <button type="button" disabled aria-label="New request (not available yet)">
          <AdminIcon name="plus" size={22} />
        </button>
        <button type="button" disabled aria-label="Access requests (not available yet)">
          <AdminIcon name="clipboard" size={22} />
        </button>
        <button type="button" disabled aria-label="Notifications (not available yet)">
          <AdminIcon name="bell" size={22} />
        </button>
        <button type="button" disabled aria-label="Profile (not available yet)">
          <AdminIcon name="user" size={22} />
        </button>
      </nav>
    </main>
  )
}

/* ─── inline status pill (mirrors approvals .approval-status) ── */
function StatusPill({ status, label }: { status: string; label: string }) {
  const cls =
    status === 'compliant' || status === 'active' || status === 'approved'
      ? 'approved'
      : status === 'pending' || status === 'attention'
      ? 'pending'
      : status === 'rejected'
      ? 'rejected'
      : 'unknown'
  const styles: Record<string, React.CSSProperties> = {
    approved: { color: '#00834d', background: '#ecfdf3' },
    pending:  { color: '#b54708', background: '#fffaeb' },
    rejected: { color: '#b42318', background: '#fef3f2' },
    unknown:  { color: '#536075', background: '#edf0f5' },
  }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.28rem',
      padding: '0.18rem 0.55rem',
      borderRadius: '2rem',
      fontSize: '0.72rem',
      whiteSpace: 'nowrap',
      fontWeight: 600,
      ...styles[cls],
    }}>
      <span style={{ width: '0.3rem', height: '0.3rem', borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
      {label}
    </span>
  )
}

export default DashboardPage
