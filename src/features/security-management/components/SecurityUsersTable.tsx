/**
 * BrainMint — Security Workforce Directory Table
 * Scope: src/features/security-management/components/SecurityUsersTable.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Columns:
 * - Employee (avatar, name, email, employee ID)
 * - Department
 * - Role (badge)
 * - Status (dot indicator: active green, suspended red, invited amber)
 * - Last active
 * - Action (Manage action button)
 */

import React from 'react'
import type {
  SecurityUserRecord,
  SecurityUserRole,
  SecurityUserStatus,
} from '../types/securityUser.types'
import { Icon } from '../../../components/ui'
import './SecurityUsersTable.css'

interface SecurityUsersTableProps {
  users: SecurityUserRecord[]
  isLoading: boolean
  hasActiveFilters: boolean
  onManage: (user: SecurityUserRecord) => void
  onViewDetails: (user: SecurityUserRecord) => void
}

const COL_SPAN = 6

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function SecurityRoleBadge({ role }: { role: SecurityUserRole }) {
  let modifier = 'employee'
  if (role === 'Security Administrator') modifier = 'admin'
  else if (role === 'Team Lead') modifier = 'lead'

  return (
    <span className={`secuser-role-badge secuser-role-badge--${modifier}`}>
      {role}
    </span>
  )
}

export function SecurityStatusIndicator({ status }: { status: SecurityUserStatus }) {
  const label =
    status === 'active'
      ? 'Active'
      : status === 'suspended'
      ? 'Suspended'
      : 'Invited'

  return (
    <span className="secuser-status-indicator">
      <span
        className={`secuser-status-dot secuser-status-dot--${status}`}
        aria-hidden="true"
      />
      <span className={`secuser-status-text--${status}`}>{label}</span>
    </span>
  )
}

export const SecurityUsersTable: React.FC<SecurityUsersTableProps> = ({
  users,
  isLoading,
  hasActiveFilters,
  onManage,
  onViewDetails,
}) => {
  return (
    <div className="secpol-table-scroll">
      <table className="secpol-table secuser-table">
        <thead>
          <tr>
            <th scope="col">Employee</th>
            <th scope="col">Department</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Last active</th>
            <th scope="col" style={{ textAlign: 'right' }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="secpol-state-panel" role="status" aria-live="polite">
                  <Icon name="refresh" size={24} className="secpol-spin" />
                  <h2>Loading workforce directory…</h2>
                  <p>Fetching workforce identities from mock security snapshot.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading && users.length === 0 && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="secpol-state-panel" role="status">
                  <Icon name="search" size={24} />
                  {hasActiveFilters ? (
                    <>
                      <h2>No workforce members match these filters</h2>
                      <p>Try refining or clearing your search term and filters.</p>
                    </>
                  ) : (
                    <>
                      <h2>No users registered</h2>
                      <p>The workforce directory is currently empty.</p>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )}

          {!isLoading &&
            users.map((user) => {
              const avatarIndex = (user.email.length % 5) + 1
              return (
                <tr
                  key={user.id}
                  className="secpol-row"
                  onClick={() => onViewDetails(user)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onViewDetails(user)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${user.fullName}`}
                >
                  {/* Employee identity */}
                  <td>
                    <div className="secuser-cell-employee">
                      <span
                        className={`secuser-avatar secuser-avatar--${avatarIndex}`}
                        aria-hidden="true"
                      >
                        {initials(user.fullName)}
                      </span>
                      <div className="secuser-meta">
                        <strong className="secuser-name">{user.fullName}</strong>
                        <span className="secuser-subtext">
                          {user.email} · {user.employeeId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td>
                    <span className="secpol-cell-text">{user.department}</span>
                  </td>

                  {/* Role */}
                  <td>
                    <SecurityRoleBadge role={user.role} />
                  </td>

                  {/* Status */}
                  <td>
                    <SecurityStatusIndicator status={user.status} />
                  </td>

                  {/* Last active */}
                  <td>
                    <span className="secpol-cell-text">{user.lastActive}</span>
                  </td>

                  {/* Action */}
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="secuser-action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onManage(user)
                      }}
                      aria-label={`Manage ${user.fullName}`}
                    >
                      Manage
                      <Icon name="chevron-right" size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}

export default SecurityUsersTable
