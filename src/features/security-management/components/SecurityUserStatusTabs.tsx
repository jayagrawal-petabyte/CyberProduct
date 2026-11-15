/**
 * BrainMint — Security User Status Tabs
 * Scope: src/features/security-management/components/SecurityUserStatusTabs.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Status filter tabs rendered above the directory table with live badge counts:
 * All users (256), Active (248), Suspended (8), Invitations (3).
 */

import React from 'react'
import type { SecurityUserTabFilter } from '../types/securityUser.types'
import './SecurityUsersTable.css'

interface SecurityUserStatusTabsProps {
  value: SecurityUserTabFilter
  onChange: (next: SecurityUserTabFilter) => void
  totalUsers: number
  activeCount: number
  suspendedCount: number
  invitationsCount: number
  isLoading: boolean
}

export const SecurityUserStatusTabs: React.FC<SecurityUserStatusTabsProps> = ({
  value,
  onChange,
  totalUsers,
  activeCount,
  suspendedCount,
  invitationsCount,
  isLoading,
}) => {
  return (
    <div className="secuser-tabs" role="tablist" aria-label="Filter workforce by account status">
      <button
        type="button"
        role="tab"
        aria-selected={value === 'all'}
        className={`secuser-tab${value === 'all' ? ' secuser-tab--current' : ''}`}
        onClick={() => onChange('all')}
      >
        All users
        <span className="secuser-tab__count">{isLoading ? '–' : totalUsers}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={value === 'active'}
        className={`secuser-tab${value === 'active' ? ' secuser-tab--current' : ''}`}
        onClick={() => onChange('active')}
      >
        Active
        <span className="secuser-tab__count">{isLoading ? '–' : activeCount}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={value === 'suspended'}
        className={`secuser-tab${value === 'suspended' ? ' secuser-tab--current' : ''}`}
        onClick={() => onChange('suspended')}
      >
        Suspended
        <span className="secuser-tab__count">{isLoading ? '–' : suspendedCount}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={value === 'invited'}
        className={`secuser-tab${value === 'invited' ? ' secuser-tab--current' : ''}`}
        onClick={() => onChange('invited')}
      >
        Invitations
        <span className="secuser-tab__count">{isLoading ? '–' : invitationsCount}</span>
      </button>
    </div>
  )
}

export default SecurityUserStatusTabs

