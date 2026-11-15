/**
 * BrainMint Admin — Employee Directory Table
 * Scope: src/features/admin/components/UsersTable.tsx
 *
 * Renders the filtered/paged employee records in a table that mirrors
 * the DashboardPage activity table styling (BrainMint design language).
 * Rows are clickable and expose an explicit "View details" action.
 */

import React from 'react'
import { AdminUserRecord, UserAccountStatus } from '../types/user.types'
import { Icon } from '../../../components/ui'
import './UsersTable.css'

interface UsersTableProps {
  users: AdminUserRecord[]
  isLoading: boolean
  /** True when filters are active and no records matched (vs. true empty dataset). */
  hasActiveFilters: boolean
  onViewDetails: (user: AdminUserRecord) => void
}

const COL_SPAN = 7

/** Status → display label. */
const STATUS_LABELS: Record<UserAccountStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function AvatarBubble({ name, index }: { name: string; index: number }) {
  return (
    <span className={`users-avatar users-avatar--${(index % 5) + 1}`} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

export function StatusBadge({ status }: { status: UserAccountStatus }) {
  return (
    <span className={`users-status-badge users-status-badge--${status}`}>
      <span className={`users-status-dot users-status-dot--${status}`} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  )
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  hasActiveFilters,
  onViewDetails,
}) => {
  return (
    <div className="users-table-scroll">
      <table className="users-table">
        <thead>
          <tr>
            <th scope="col">Employee</th>
            <th scope="col">Employee ID</th>
            <th scope="col">Department</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Last Active</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="users-state" role="status" aria-live="polite">
                  <Icon name="clock" size={26} className="users-icon-muted" />
                  <h2>Loading employee directory…</h2>
                  <p>Fetching the mock employee dataset.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading && users.length === 0 && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="users-state" role="status">
                  <Icon name="search" size={26} className="users-icon-muted" />
                  {hasActiveFilters ? (
                    <>
                      <h2>No employees match these filters</h2>
                      <p>Try a different search term or filter combination.</p>
                    </>
                  ) : (
                    <>
                      <h2>No employees yet</h2>
                      <p>The employee directory is empty right now.</p>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )}

          {!isLoading &&
            users.map((user, index) => (
              <tr
                key={user.id}
                className="users-row"
                tabIndex={0}
                aria-label={`View details for ${user.fullName}`}
                onClick={() => onViewDetails(user)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onViewDetails(user)
                  }
                }}
              >
                <td>
                  <div className="users-employee-cell">
                    <AvatarBubble name={user.fullName} index={index} />
                    <div className="users-employee-meta">
                      <span className="users-employee-name">{user.fullName}</span>
                      <span className="users-employee-email">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="users-employee-id">{user.employeeId}</span>
                </td>
                <td>
                  <span className="users-cell-text">{user.department}</span>
                </td>
                <td>
                  <span className="users-role-pill">{user.role}</span>
                </td>
                <td>
                  <StatusBadge status={user.status} />
                </td>
                <td>
                  <span className="users-last-active">{user.lastActive}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="users-view-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDetails(user)
                    }}
                    aria-label={`View details for ${user.fullName}`}
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

export default UsersTable
