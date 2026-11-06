/**
 * BrainMint — Invite User Modal
 * Scope: src/features/security-management/components/InviteUserModal.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Provides the "Invite user" creation form matching requirements:
 * - Full name (required)
 * - Corporate Email (required, valid email pattern)
 * - Department (required selection)
 * - Role (required selection)
 * - Required-field and email validation
 * - Honest local-prototype confirmation notice
 */

import React, { useState } from 'react'
import type {
  InviteUserFormValues,
  SecurityUserRole,
} from '../types/securityUser.types'
import { Modal, Icon } from '../../../components/ui'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: InviteUserFormValues) => void
  roles: SecurityUserRole[]
  departments: string[]
}

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  roles,
  departments,
}) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState(departments[0] || 'Engineering')
  const [role, setRole] = useState<SecurityUserRole>('Employee')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}

    if (!fullName.trim()) {
      nextErrors.fullName = 'Full name is required.'
    } else if (fullName.trim().length < 2) {
      nextErrors.fullName = 'Please enter a valid full name.'
    }

    if (!email.trim()) {
      nextErrors.email = 'Corporate email is required.'
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Please provide a valid corporate email address.'
    }

    if (!department) {
      nextErrors.department = 'Department is required.'
    }

    if (!role) {
      nextErrors.role = 'Role selection is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      department,
      role,
    })

    // Reset fields
    setFullName('')
    setEmail('')
    setDepartment(departments[0] || 'Engineering')
    setRole('Employee')
    setErrors({})
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Workforce User"
      description="Send onboarding invitation and assign security access role."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="secpol-modal-body">
          <p className="secpol-dev-note" style={{ marginBottom: '1.25rem' }}>
            <Icon name="alert-triangle" size={14} />
            <span>
              <strong>Local prototype:</strong> Submitting will record an in-memory invited member in the directory. No emails or Okta invitations are actually dispatched.
            </span>
          </p>

          {/* Full Name */}
          <div className="secpol-form-field">
            <label htmlFor="invite-fullname" className="secpol-label">
              Full Name <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="invite-fullname"
              type="text"
              className={`secpol-input ${errors.fullName ? 'secpol-input--error' : ''}`}
              placeholder="e.g. Maya Lin"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }))
              }}
              required
            />
            {errors.fullName && <p className="secpol-form-error">{errors.fullName}</p>}
          </div>

          {/* Corporate Email */}
          <div className="secpol-form-field">
            <label htmlFor="invite-email" className="secpol-label">
              Corporate Email <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="invite-email"
              type="email"
              className={`secpol-input ${errors.email ? 'secpol-input--error' : ''}`}
              placeholder="e.g. maya.lin@acme.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              required
            />
            {errors.email && <p className="secpol-form-error">{errors.email}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Department */}
            <div className="secpol-form-field">
              <label htmlFor="invite-dept" className="secpol-label">
                Department <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                id="invite-dept"
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
              <label htmlFor="invite-role" className="secpol-label">
                Role <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                id="invite-role"
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
              <Icon name="plus" size={13} />
              Send Invitation
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default InviteUserModal
