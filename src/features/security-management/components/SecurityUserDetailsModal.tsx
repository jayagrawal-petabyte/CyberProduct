/**
 * BrainMint — Security User Details Modal
 * Scope: src/features/security-management/components/SecurityUserDetailsModal.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * View-only inspector modal presenting complete identity and access posture info:
 * - Full name, email, employee ID, designation
 * - Department, assigned role, account status
 * - Security clearance level, MFA enrollment, linked devices count
 * - Last active and account created timestamp
 */

import React from 'react'
import type { SecurityUserRecord } from '../types/securityUser.types'
import { Modal, Icon } from '../../../components/ui'
import { SecurityRoleBadge, SecurityStatusIndicator } from './SecurityUsersTable'

interface SecurityUserDetailsModalProps {
  user: SecurityUserRecord | null
  onClose: () => void
  onEdit: (user: SecurityUserRecord) => void
}

interface DetailRowProps {
  label: string
  value: React.ReactNode
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="secpol-modal-row">
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
)

export const SecurityUserDetailsModal: React.FC<SecurityUserDetailsModalProps> = ({
  user,
  onClose,
  onEdit,
}) => {
  if (!user) return null

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const avatarIndex = (user.email.length % 5) + 1

  return (
    <Modal
      isOpen={user !== null}
      onClose={onClose}
      title="Workforce Identity Details"
      description="Administrative security view — development mock data."
      maxWidth="md"
    >
      <div className="secpol-modal-body">
        {/* Identity card */}
        <div className="secpol-modal-hero" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#fdf7f9', borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
          <span
            className={`secuser-avatar secuser-avatar--${avatarIndex}`}
            style={{ width: '3rem', height: '3rem', fontSize: '1rem' }}
            aria-hidden="true"
          >
            {initials}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: '1.1rem', color: '#1e1229' }}>{user.fullName}</strong>
            <span style={{ fontSize: '0.82rem', color: '#6f5d6b' }}>
              {user.designation || 'Workforce Member'} · {user.department}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <SecurityRoleBadge role={user.role} />
              <SecurityStatusIndicator status={user.status} />
            </div>
          </div>
        </div>

        {/* Details list */}
        <dl className="secpol-modal-details">
          <DetailRow
            label="Employee ID"
            value={<code className="secpol-code">{user.employeeId}</code>}
          />
          <DetailRow label="Corporate Email" value={user.email} />
          <DetailRow label="Department" value={user.department} />
          <DetailRow label="Assigned Role" value={user.role} />
          <DetailRow
            label="Security Clearance"
            value={
              <span style={{ fontWeight: 600, color: user.securityClearance === 'Admin' ? '#6b21a8' : '#1e1229' }}>
                {user.securityClearance || 'Standard'}
              </span>
            }
          />
          <DetailRow
            label="MFA Enrolled"
            value={
              user.mfaEnabled ? (
                <span style={{ color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                  <Icon name="check-circle" size={14} /> Enabled (Hardware key / TOTP)
                </span>
              ) : (
                <span style={{ color: '#ca8a04', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                  <Icon name="alert-triangle" size={14} /> Not enrolled
                </span>
              )
            }
          />
          <DetailRow
            label="Linked Devices"
            value={`${user.deviceCount ?? 1} managed endpoints`}
          />
          <DetailRow label="Last Active" value={user.lastActive} />
          <DetailRow label="Account Created" value={user.accountCreated} />
        </dl>

        <p className="secpol-dev-note">
          <Icon name="lock" size={13} />
          <span>
            Directory visibility only — no credentials, passwords, or session tokens are stored. Real privilege enforcement and account provisioning run on the backend IdP.
          </span>
        </p>

        <div className="secpol-modal-actions" style={{ marginTop: '1.25rem' }}>
          <button
            type="button"
            className="secpol-btn-ghost"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="secpol-btn-primary"
            onClick={() => {
              onClose()
              onEdit(user)
            }}
          >
            Manage User
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default SecurityUserDetailsModal

