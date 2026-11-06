/**
 * BrainMint — Security Policy Details Modal
 * Scope: src/features/security-management/components/PolicyDetailsModal.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * View-only details sheet built on the shared BrainMint `Modal`
 * (Escape-to-close, backdrop dismissal, body scroll lock). Shows library
 * information only — nothing here is enforced. An "Edit policy" action
 * hands the record back to the page for the edit form.
 */

import React from 'react'
import {
  SecurityPolicyRecord,
} from '../types/policy.types'
import { Modal, Icon } from '../../../components/ui'
import { PolicyStatePill, EnforcementLabel } from './PoliciesTable'

interface PolicyDetailsModalProps {
  policy: SecurityPolicyRecord | null
  onClose: () => void
  /** Opens the Create/Edit form in edit mode for this record. */
  onEdit: (policy: SecurityPolicyRecord) => void
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

export const PolicyDetailsModal: React.FC<PolicyDetailsModalProps> = ({
  policy,
  onClose,
  onEdit,
}) => {
  const showAcknowledgment =
    policy !== null &&
    policy.enforcement === 'Acknowledgment' &&
    policy.ackTarget > 0

  const ackPct =
    policy && policy.ackTarget > 0
      ? Math.round((policy.ackCurrent / policy.ackTarget) * 100)
      : 0

  return (
    <Modal
      isOpen={policy !== null}
      onClose={onClose}
      title="Policy details"
      description="Library record — development mock data. Not enforced."
      maxWidth="md"
    >
      {policy && (
        <div className="secpol-modal-body">
          {/* Identity block */}
          <div className="secpol-modal-identity">
            <div className="secpol-modal-identity__meta">
              <strong>{policy.name}</strong>
              <span>
                {policy.policyId} · {policy.category}
              </span>
            </div>
            <PolicyStatePill state={policy.state} />
          </div>

          <p className="secpol-modal-desc">{policy.description}</p>

          {/* Detail grid */}
          <dl className="secpol-modal-details">
            <DetailRow
              label="Policy ID"
              value={<span className="secpol-mono">{policy.policyId}</span>}
            />
            <DetailRow label="Version" value={<span className="secpol-mono">{policy.version}</span>} />
            <DetailRow label="State" value={<PolicyStatePill state={policy.state} />} />
            <DetailRow label="Enforcement" value={<EnforcementLabel enforcement={policy.enforcement} />} />
            <DetailRow label="Category" value={policy.category} />
            <DetailRow label="Policy owner" value={policy.ownerName} />
            <DetailRow label="Scope" value={policy.scope} />
            <DetailRow label="Effective from" value={policy.effectiveFrom} />
            <DetailRow label="Updated" value={policy.updatedOn} />
          </dl>

          {/* Workforce acknowledgment info (published acknowledgment policies) */}
          {showAcknowledgment && policy && (
            <div className="secpol-ack-box" aria-label="Workforce acknowledgment">
              <div className="secpol-ack-box__head">
                <Icon name="check-circle" size={14} />
                <span>
                  {policy.ackCurrent} of {policy.ackTarget} users up to date ({ackPct}%)
                </span>
              </div>
              <div
                className="secpol-ack-bar"
                role="img"
                aria-label={`Acknowledgment progress ${ackPct} percent`}
              >
                <span style={{ width: `${ackPct}%` }} />
              </div>
              {policy.ackDue && (
                <small>
                  Due {policy.ackDue}
                  {policy.ackTarget - policy.ackCurrent > 0
                    ? ` · ${policy.ackTarget - policy.ackCurrent} outstanding`
                    : ' · All caught up'}
                </small>
              )}
            </div>
          )}
        </div>
      )}
      {policy && (
        <div className="secpol-modal-footer">
          <button type="button" className="secpol-btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="secpol-btn-primary"
            onClick={() => onEdit(policy)}
          >
            <Icon name="edit" size={13} />
            Edit policy
          </button>
        </div>
      )}
    </Modal>
  )
}

export default PolicyDetailsModal
