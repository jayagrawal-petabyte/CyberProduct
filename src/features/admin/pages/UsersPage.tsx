/**
 * BrainMint Admin — User Management
 * Owner: Ishaan Gupta
 * Scope: src/features/admin/pages/UsersPage.tsx
 *
 * Follows the exact same structural pattern as DashboardPage:
 * - Standalone <main> element (no shared PageLayout)
 * - .users-page  → same pastel-pink/lavender bg + concentric-ring glow
 * - .users-brand-header  → BrainMint logo + profile stub
 * - .users-content → page header, summary cards, filter row,
 *                    employee table, pagination, floating dock
 *
 * ⚠️ DEVELOPMENT MOCK DATA — the directory below the servers' hood is
 * MOCK_EMPLOYEE_DIRECTORY; no real backend or account mutations exist
 * on this page.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useUsersData, filterUsers } from '../hooks/useUsersData'
import {
  AdminUserRecord,
  UserFiltersState,
  DEFAULT_USER_FILTERS,
} from '../types/user.types'
import { USER_DEPARTMENTS, USER_ROLES } from '../hooks/mockUsersData'
import { Icon } from '../../../components/ui'
import UsersTable from '../components/UsersTable'
import UserFilters from '../components/UserFilters'
import UserDetailsModal from '../components/UserDetailsModal'
import './UsersPage.css'

const PAGE_SIZE = 8

interface SummaryCardDef {
  id: string
  label: string
  value: number
  subtext: string
  iconName: 'user' | 'check-circle' | 'clock' | 'lock'
  tone: 'default' | 'success' | 'neutral' | 'danger'
}

/** Builds the four summary cards from computed metrics — no hardcoded counts. */
function buildSummaryCards(
  summary: ReturnType<typeof useUsersData>['summary'],
): SummaryCardDef[] {
  return [
    {
      id: 'u-total',
      label: 'Total Employees',
      value: summary.total,
      subtext: 'Records in the directory',
      iconName: 'user',
      tone: 'default',
    },
    {
      id: 'u-active',
      label: 'Active Users',
      value: summary.active,
      subtext: 'Currently signed in to the workspace',
      iconName: 'check-circle',
      tone: 'success',
    },
    {
      id: 'u-inactive',
      label: 'Inactive Users',
      value: summary.inactive,
      subtext: 'No recent sign-in activity',
      iconName: 'clock',
      tone: 'neutral',
    },
    {
      id: 'u-suspended',
      label: 'Suspended Users',
      value: summary.suspended,
      subtext: 'Accounts temporarily blocked',
      iconName: 'lock',
      tone: 'danger',
    },
  ]
}

/** Simple windowed page list with ellipsis handling. */
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

export const UsersPage: React.FC = () => {
  const { users, summary, isLoading, lastUpdated, refetch } = useUsersData()
  const [filters, setFilters] = useState<UserFiltersState>(DEFAULT_USER_FILTERS)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminUserRecord | null>(null)

  // 1) Apply all filters together, memoized.
  const filtered = useMemo(() => filterUsers(users, filters), [users, filters])

  // 2) Reset pagination whenever the filters (or dataset) change.
  useEffect(() => {
    setPage(1)
  }, [filters, users])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRecords = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasActiveFilters = useMemo(
    () =>
      filters.search.trim() !== '' ||
      filters.department !== 'all' ||
      filters.role !== 'all' ||
      filters.status !== 'all',
    [filters],
  )

  const summaryCards = useMemo(() => buildSummaryCards(summary), [summary])

  return (
    <main className="users-page">
      <a className="users-skip-link" href="#users-content">Skip to main content</a>

      {/* ── Brand header ── */}
      <header className="users-brand-header">
        <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        <button className="users-profile-button" type="button" aria-label="Profile">
          <Icon name="user" size={21} />
        </button>
      </header>

      <div className="users-content" id="users-content">

        {/* ── Page header ── */}
        <header className="users-page-header">
          <div>
            <h1>User Management</h1>
            <p>Manage employees, roles, and account access across your organization.</p>
          </div>
          <div className="users-page-actions">
            <span>Employees: <strong>{summary.total}</strong></span>
            <span title="Development mock data">Development mock data</span>
            <button
              type="button"
              className="users-refresh"
              onClick={refetch}
              disabled={isLoading}
              aria-label={isLoading ? 'Refreshing employee directory' : 'Refresh employee directory'}
            >
              <Icon name="refresh" size={17} className={isLoading ? 'users-spin' : ''} />
            </button>
          </div>
        </header>

        {/* ── Summary cards ── */}
        <section className="users-summary" aria-label="Employee account overview">
          {summaryCards.map(card => (
            <article
              key={card.id}
              className={`users-summary-card users-summary-card--${card.tone}`}
            >
              <div>
                <span className="users-summary-card__label">{card.label}</span>
                <strong className="users-summary-card__value" aria-label={`${card.label}: ${card.value}`}>
                  {card.value.toLocaleString()}
                </strong>
                <small className="users-summary-card__detail">{card.subtext}</small>
              </div>
              <span className="users-summary-card__icon">
                <Icon name={card.iconName} size={21} />
              </span>
            </article>
          ))}
        </section>

        {/* ── Employee directory card ── */}
        <section className="users-table-card" aria-label="Employee directory">
          <div className="users-table-controls">
            <h2 className="users-table-controls__title">Employee Directory</h2>
            <UserFilters
              filters={filters}
              onChange={setFilters}
              departments={USER_DEPARTMENTS}
              roles={USER_ROLES}
              resultCount={filtered.length}
              totalCount={users.length}
            />
          </div>

          <UsersTable
            users={pageRecords}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onViewDetails={setSelected}
          />

          {/* ── Pagination ── */}
          <nav className="users-pagination" aria-label="Employee directory pagination">
            <span className="users-pagination__meta">
              {filtered.length} of {users.length} records
              {' · '}Last updated {lastUpdated}
            </span>
            <div className="users-pagination__controls">
              <button
                type="button"
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              <ol className="users-pagination__pages">
                {pageList(safePage, totalPages).map((item, i) =>
                  item === 'gap' ? (
                    <li key={`gap-${i}`} className="users-pagination__gap" aria-hidden="true">…</li>
                  ) : (
                    <li key={item}>
                      <button
                        type="button"
                        className={item === safePage ? 'users-pagination__page--current' : ''}
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
      <UserDetailsModal user={selected} onClose={() => setSelected(null)} />

      {/* ── Bottom navigation dock ── */}
      <nav className="users-bottom-nav" aria-label="Primary navigation">
        <button type="button" aria-label="Dashboard (admin overview)">
          <Icon name="grid" size={22} />
        </button>
        <button type="button" disabled aria-label="Devices (not available yet)">
          <Icon name="monitor" size={22} />
        </button>
        <button type="button" disabled aria-label="New request (not available yet)">
          <Icon name="plus" size={22} />
        </button>
        <button type="button" aria-label="Users (not available yet)" className="users-bottom-nav__child">
          <Icon name="user" size={22} />
        </button>
        <button type="button" disabled aria-label="Access requests (not available yet)">
          <Icon name="bell" size={22} />
        </button>
        <button type="button" disabled aria-label="Profile (not available yet)">
          <Icon name="user" size={22} />
        </button>
      </nav>
    </main>
  )
}

export default UsersPage
