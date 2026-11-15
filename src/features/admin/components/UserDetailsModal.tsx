/**
 * BrainMint Admin — Employee Details Modal
 * Scope: src/features/admin/components/UserDetailsModal.tsx
 *
 * View-only details sheet for a directory record. Built on the shared
 * BrainMint `Modal` component (Escape-to-close, backdrop dismissal,
 * labelled dialog, close button). No credentials or authentication
 * information are shown by design.
 */

import React from 'react'
import { AdminUserRecord } from '../types/user.types'
import { Modal } from '../../../components/ui'

interface UserDetailsModalProps {
  user: AdminUserRecord | null
  onClose: () => void
}

interface DetailRowProps {
  label: string
  value: React.ReactNode
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="users-modal-row">
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
)

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  return (
    <Modal
      isOpen={user !== null}
      onClose={onClose}
      title="Employee Details"
      description="Directory record — development mock data."
      maxWidth="md"
    >
      {user && (
        <div className="users-modal-body">
          {/* Identity block */}
          <div className="users-modal-identity">
            <span className={`users-avatar users-avatar--${(user.email.length % 5) + 1}`} aria-hidden="true">
              {user.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
            </span>
            <div className="users-modal-identity__meta">
              <strong>{user.fullName}</strong>
              <span>{user.designation}</span>
            </div>
          </div>

          {/* Detail grid */}
          <dl className="users-modal-details">
            <DetailRow label="Employee ID" value={<span className="users-operator-code">{user.employeeId}</span>} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Department" value={user.department} />
            <DetailRow label="Designation" value={user.designation} />
            <DetailRow label="Role" value={user.role} />
            <DetailRow
              label="Account Status"
              value={
                <span className={`users-status-badge users-status-badge--${user.status}`}>
                  <span
                    className={`users-status-dot users-status-dot--${user.status}`}
                    aria-hidden="true"
                  />
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              }
            />
            <DetailRow label="Enrolled Devices" value={String(user.deviceCount)} />
            <DetailRow label="Last Active" value={user.lastActive} />
            <DetailRow label="Account Created" value={user.accountCreated} />
          </dl>
        </div>
      )}
    </Modal>
  )
}

export default UserDetailsModal
