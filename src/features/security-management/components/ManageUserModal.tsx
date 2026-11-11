/**
 * BrainMint — Manage User Modal
 * Scope: src/features/security-management/components/ManageUserModal.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Provides the "Manage user" edit form:
 * - View identity details
 * - Edit permitted profile fields (Full Name, Department, Assigned Role, Account Status)
 * - Support local prototype actions without real identity provisioning or privilege enforcement
 */

import React, { useEffect, useState } from 'react'
import type {
  ManageUserFormValues,
  SecurityUserRecord,
  SecurityUserRole,
  SecurityUserStatus,
} from '../types/securityUser.types'
import { Modal, Icon } from '../../../components/ui'

interface ManageUserModalProps {
  user: SecurityUserRecord | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (id: string, values: ManageUserFormValues) => void
  roles: SecurityUserRole[]
  departments: string[]
}

export const ManageUserModal: React.FC<ManageUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSubmit,
  roles,
  departments,
}) => {
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState<SecurityUserRole>('Employee')
  const [status, setStatus] = useState<SecurityUserStatus>('active')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setFullName(user.fullName)
      setDepartment(user.department)
      setRole(user.role)
      setStatus(user.status)
      setError('')
    }
  }, [user])

  if (!user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Full name cannot be blank.')
      return
    }

    onSubmit(user.id, {
      fullName: fullName.trim(),
      email: user.email,
      department,
      role,
      status,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Workforce User"
      description={`Editing ${user.fullName} (${user.employeeId})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="secpol-modal-body">
          <p className="secpol-dev-note" style={{ marginBottom: '1.25rem' }}>
            <Icon name="alert-triangle" size={14} />
            <span>
              <strong>Local prototype:</strong> Updates will be applied in-memory. This does not alter SCIM credentials, SSO sessions, or revoke actual enterprise access tokens.
            </span>
          </p>

          {/* Full Name */}
          <div className="secpol-form-field">
            <label htmlFor="manage-fullname" className="secpol-label">
              Full Name
            </label>
            <input
              id="manage-fullname"
              type="text"
              className={`secpol-input ${error ? 'secpol-input--error' : ''}`}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (error) setError('')
              }}
              required
            />
            {error && <p className="secpol-form-error">{error}</p>}
          </div>

          {/* Readonly Email */}
          <div className="secpol-form-field">
            <label htmlFor="manage-email" className="secpol-label">
              Corporate Email (Identity Primary Key)
            </label>
            <input
              id="manage-email"
              type="email"
              className="secpol-input"
              value={user.email}
              disabled
              style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Department */}
            <div className="secpol-form-field">
              <label htmlFor="manage-dept" className="secpol-label">
                Department
              </label>
              <select
                id="manage-dept"
                className="secpol-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div className="secpol-form-field">
              <label htmlFor="manage-role" className="secpol-label">
                Assigned Role
              </label>
              <select
                id="manage-role"
                className="secpol-input"
                value={role}
                onChange={(e) => setRole(e.target.value as SecurityUserRole)}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Status */}
          <div className="secpol-form-field" style={{ marginTop: '0.5rem' }}>
            <label htmlFor="manage-status" className="secpol-label">
              Account Status
            </label>
            <select
              id="manage-status"
              className="secpol-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as SecurityUserStatus)}
            >
              <option value="active">Active (Access allowed)</option>
              <option value="suspended">Suspended (Access blocked)</option>
              <option value="invited">Invited (Pending signup)</option>
            </select>
          </div>

          <div className="secpol-modal-actions" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="secpol-btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="secpol-btn-primary"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default ManageUserModal
