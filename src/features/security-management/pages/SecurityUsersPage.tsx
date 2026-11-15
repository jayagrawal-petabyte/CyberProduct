/**
 * BrainMint — Security User Management Page
 * Scope: src/features/security-management/pages/SecurityUsersPage.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Implements the fifth and final assigned screen: "Security User Management".
 * Follows the exact same structural chassis as the other 4 completed screens:
 * - BrainMint branding + User Management heading & subtitle
 * - "Invite user" primary action
 * - 4 Summary metric cards derived from dataset:
 *   1. Total users: 256 (248 active, 8 suspended)
 *   2. Employees: 226
 *   3. Team leads: 18
 *   4. Security administrators: 04
 * - Supporting figures: 248 active, 8 suspended, 3 invitations
 * - Workforce Directory card with tabs (All users, Active, Suspended, Invitations)
 * - Search by name, email, employee ID + Role & Department dropdowns
 * - Directory table (Employee, Department, Role, Status, Last active, Action)
 * - User Details Modal & Manage User Modal
 * - Invite User Modal with honest prototype validation
 * - Pagination (6 or 8 per page)
 * - FloatingDock integration with bottom clearance
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../../components/ui'
import SecurityUsersTable from '../components/SecurityUsersTable'
import SecurityUserStatusTabs from '../components/SecurityUserStatusTabs'
import SecurityUserFilters from '../components/SecurityUserFilters'
import SecurityUserDetailsModal from '../components/SecurityUserDetailsModal'
import InviteUserModal from '../components/InviteUserModal'
import ManageUserModal from '../components/ManageUserModal'
import {
  useSecurityUsers,
  filterSecurityUsers,
} from '../hooks/useSecurityUsers'
import type {
  SecurityUserFiltersState,
  SecurityUserRecord,
  InviteUserFormValues,
  ManageUserFormValues,
} from '../types/securityUser.types'
import { DEFAULT_SECURITY_USER_FILTERS } from '../types/securityUser.types'
// Reusing the shared visual chassis of the security-management module
import './SecurityPoliciesPage.css'

const PAGE_SIZE = 8

/** Windowed page list with ellipsis handling. */
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

/** Formats values with zero-padding (e.g. 4 -> "04"). */
function formatTwoDigit(value: number): string {
  return String(value).padStart(2, '0')
}

export const SecurityUsersPage: React.FC = () => {
  const {
    users,
    summary,
    isLoading,
    lastUpdated,
    departments,
    roles,
    inviteUser,
    updateUser,
  } = useSecurityUsers()

  const [filters, setFilters] = useState<SecurityUserFiltersState>(
    DEFAULT_SECURITY_USER_FILTERS,
  )
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<SecurityUserRecord | null>(null)
  const [managedUser, setManagedUser] = useState<SecurityUserRecord | null>(null)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Apply filters memoized
  const filtered = useMemo(
    () => filterSecurityUsers(users, filters),
    [users, filters],
  )

  // Reset pagination when filters or data change
  useEffect(() => {
    setPage(1)
  }, [filters, users])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRecords = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.role !== 'all' ||
    filters.department !== 'all' ||
    filters.status !== 'all'

  const handleInviteSubmit = (values: InviteUserFormValues) => {
    const created = inviteUser(values)
    setFeedback(`Invitation recorded for ${created.fullName} (${created.email}) — local prototype only.`)
  }

  const handleManageSubmit = (id: string, values: ManageUserFormValues) => {
    const updated = updateUser(id, values)
    setFeedback(`Identity profile updated for ${updated.fullName} — local prototype in-memory state.`)
  }

  return (
    <main className="secpol-page secuser-page">
      <a className="secpol-skip-link" href="#secuser-content">
        Skip to main content
      </a>
      <span className="secpol-accent-dot" aria-hidden="true" />

      {/* ── Brand header ── */}
      <header className="secpol-brand-header">
        <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        <button className="secpol-profile-button" type="button" aria-label="Profile">
          <Icon name="user" size={21} />
        </button>
      </header>

      <div className="secpol-content" id="secuser-content">
        {/* ── Page header ── */}
        <header className="secpol-page-header">
          <div>
            <h1>User Management</h1>
            <p>Manage workforce identities, assigned roles, and account status across Acme.</p>
          </div>
          <div className="secpol-page-actions">
            <span title="All data on this screen is development mock data">Development mock data</span>
            <button
              type="button"
              className="secpol-btn-primary"
              onClick={() => setIsInviteOpen(true)}
              aria-label="Invite user"
            >
              <Icon name="plus" size={13} />
              Invite user
            </button>
          </div>
        </header>

        {/* ── Feedback banner ── */}
        {feedback && (
          <div className="secpol-feedback" role="status">
            <Icon name="check-circle" size={15} />
            <span>{feedback}</span>
            <button
              type="button"
              className="secpol-search-clear"
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onClick={() => setFeedback(null)}
              aria-label="Dismiss feedback"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        )}

        {/* ── Summary Cards ── */}
        <section className="secpol-summary" aria-label="Workforce identities overview">
          {/* Card 1: Total users */}
          <article className="secpol-metric">
            <span className="secpol-metric-label">Total users</span>
            <strong className="secpol-metric-value" aria-label={`Total users: ${summary.total}`}>
              {summary.total}
            </strong>
            <small className="secpol-metric-sub">
              {summary.active} active · {summary.suspended} suspended
            </small>
          </article>

          {/* Card 2: Employees */}
          <article className="secpol-metric">
            <span className="secpol-metric-label">Employees</span>
            <strong className="secpol-metric-value" aria-label={`Employees: ${summary.employees}`}>
              {summary.employees}
            </strong>
            <small className="secpol-metric-sub secpol-metric-sub--success">
              Active standard workforce
            </small>
          </article>

          {/* Card 3: Team leads */}
          <article className="secpol-metric">
            <span className="secpol-metric-label">Team leads</span>
            <strong className="secpol-metric-value" aria-label={`Team leads: ${summary.teamLeads}`}>
              {summary.teamLeads}
            </strong>
            <small className="secpol-metric-sub">
              Elevated access supervisors
            </small>
          </article>

          {/* Card 4: Security administrators */}
          <article className="secpol-metric">
            <span className="secpol-metric-label">Security administrators</span>
            <strong
              className="secpol-metric-value"
              aria-label={`Security administrators: ${formatTwoDigit(summary.securityAdmins)}`}
            >
              {formatTwoDigit(summary.securityAdmins)}
            </strong>
            <small className="secpol-metric-sub secpol-metric-sub--warning">
              Privileged security officers
            </small>
          </article>
        </section>

        {/* ── Workforce Directory Section ── */}
        <section className="secpol-library secuser-library" aria-label="Workforce directory">
          <div className="secpol-library-head">
            <h2 className="secpol-library-title">Workforce Directory</h2>
            <p className="secpol-library-sub">
              Directory of verified organizational identities and pending invitations
              {' · '}Refreshed {lastUpdated}
            </p>
          </div>

          {/* Status Tabs with accurate count pills */}
          <SecurityUserStatusTabs
            value={filters.status}
            onChange={(status) => setFilters((prev) => ({ ...prev, status }))}
            totalUsers={summary.total}
            activeCount={summary.active}
            suspendedCount={summary.suspended}
            invitationsCount={summary.invitations}
            isLoading={isLoading}
          />

          {/* Filters Toolbar */}
          <div className="secpol-toolbar">
            <SecurityUserFilters
              filters={filters}
              onChange={setFilters}
              roles={roles}
              departments={departments}
              resultCount={filtered.length}
              totalCount={users.length}
            />
          </div>

          {/* Workforce Directory Table */}
          <SecurityUsersTable
            users={pageRecords}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onManage={(user) => setManagedUser(user)}
            onViewDetails={(user) => setSelectedUser(user)}
          />

          {/* Pagination */}
          {!isLoading && filtered.length > 0 && (
            <footer className="secpol-pagination" aria-label="Workforce pagination">
              <span className="secpol-page-range">
                Showing{' '}
                <strong>
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filtered.length)}
                </strong>{' '}
                of <strong>{filtered.length}</strong> {filtered.length === 1 ? 'user' : 'users'}
              </span>

              <div className="secpol-page-controls">
                <button
                  type="button"
                  className="secpol-btn-ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  aria-label="Previous page"
                >
                  <Icon name="chevron-left" size={13} />
                  Prev
                </button>

                <div className="secpol-page-pills">
                  {pageList(safePage, totalPages).map((p, idx) =>
                    p === 'gap' ? (
                      <span key={`gap-${idx}`} className="secpol-page-gap" aria-hidden="true">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        aria-current={p === safePage ? 'page' : undefined}
                        className={`secpol-page-pill${p === safePage ? ' secpol-page-pill--active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  className="secpol-btn-ghost"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  aria-label="Next page"
                >
                  Next
                  <Icon name="chevron-right" size={13} />
                </button>
              </div>
            </footer>
          )}
        </section>
      </div>

      {/* ── Modals ── */}
      <SecurityUserDetailsModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onEdit={(user) => setManagedUser(user)}
      />

      <ManageUserModal
        user={managedUser}
        isOpen={managedUser !== null}
        onClose={() => setManagedUser(null)}
        onSubmit={handleManageSubmit}
        roles={roles}
        departments={departments}
      />

      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={handleInviteSubmit}
        roles={roles}
        departments={departments}
      />
    </main>
  )
}

export default SecurityUsersPage

