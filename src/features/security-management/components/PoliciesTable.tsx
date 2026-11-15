/**
 * BrainMint — Security Policies Library Table
 * Scope: src/features/security-management/components/PoliciesTable.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Renders the filtered/paged policy records matching the approved design:
 * POLICY | VERSION | STATE | ENFORCEMENT | UPDATED | ACTION.
 * Rows are clickable (Enter/Space) and expose an explicit per-row action —
 * "Manage →" for live policies, "Edit draft →" for drafts.
 *
 * This table is an administrative directory only: it never enforces a
 * policy, blocks any resource, or drives access decisions.
 */

import React from 'react'
import {
  EnforcementMode,
  PolicyState,
  POLICY_ENFORCEMENT_LABELS,
  POLICY_STATE_LABELS,
  SecurityPolicyRecord,
} from '../types/policy.types'
import { Icon } from '../../../components/ui'
import './PoliciesTable.css'

interface PoliciesTableProps {
  policies: SecurityPolicyRecord[]
  isLoading: boolean
  /** True when filters/search are active and nothing matched. */
  hasActiveFilters: boolean
  onViewDetails: (policy: SecurityPolicyRecord) => void
  onEditPolicy: (policy: SecurityPolicyRecord) => void
}

const COL_SPAN = 6

/** Dot + label state indicator (green / amber / grey / red). */
export function PolicyStateIndicator({ state }: { state: PolicyState }) {
  return (
    <span className={`secpol-state secpol-state--${state}`}>
      <span className="secpol-state-dot" aria-hidden="true" />
      {POLICY_STATE_LABELS[state]}
    </span>
  )
}

/** Pill variant used inside the details modal. */
export function PolicyStatePill({ state }: { state: PolicyState }) {
  return (
    <span className={`secpol-state-pill secpol-state-pill--${state}`}>
      <span className="secpol-state-dot" aria-hidden="true" />
      {POLICY_STATE_LABELS[state]}
    </span>
  )
}

export function EnforcementLabel({ enforcement }: { enforcement: EnforcementMode }) {
  return <span className="secpol-cell-text">{POLICY_ENFORCEMENT_LABELS[enforcement]}</span>
}

export const PoliciesTable: React.FC<PoliciesTableProps> = ({
  policies,
  isLoading,
  hasActiveFilters,
  onViewDetails,
  onEditPolicy,
}) => {
  return (
    <div className="secpol-table-scroll">
      <table className="secpol-table">
        <thead>
          <tr>
            <th scope="col">Policy</th>
            <th scope="col">Version</th>
            <th scope="col">State</th>
            <th scope="col">Enforcement</th>
            <th scope="col">Updated</th>
            <th scope="col" style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="secpol-state-panel" role="status" aria-live="polite">
                  <Icon name="refresh" size={24} className="secpol-spin" />
                  <h2>Loading policy library…</h2>
                  <p>Fetching the mock security policy dataset.</p>
                </div>
              </td>
            </tr>
          )}

          {!isLoading && policies.length === 0 && (
            <tr>
              <td colSpan={COL_SPAN}>
                <div className="secpol-state-panel" role="status">
                  <Icon name="search" size={24} />
                  {hasActiveFilters ? (
                    <>
                      <h2>No policies match this search or filter</h2>
                      <p>Try a different policy name, ID, state or category.</p>
                    </>
                  ) : (
                    <>
                      <h2>No policies in the library yet</h2>
                      <p>Create the first security policy to get started.</p>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )}

          {!isLoading &&
            policies.map((policy) => (
              <tr
                key={policy.id}
                className="secpol-row"
                tabIndex={0}
                aria-label={`View details for ${policy.name}`}
                onClick={() => onViewDetails(policy)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onViewDetails(policy)
                  }
                }}
              >
                <td>
                  <div className="secpol-policy-meta">
                    <span className="secpol-policy-name">{policy.name}</span>
                    <span className="secpol-policy-idline">
                      {policy.policyId} · {policy.ownerName}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="secpol-cell-version">{policy.version}</span>
                </td>
                <td>
                  <PolicyStateIndicator state={policy.state} />
                </td>
                <td>
                  <EnforcementLabel enforcement={policy.enforcement} />
                </td>
                <td>
                  <span className="secpol-last-updated">{policy.updatedOn}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {policy.state === 'draft' ? (
                    <button
                      type="button"
                      className="secpol-action-btn secpol-action-btn--edit"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditPolicy(policy)
                      }}
                      aria-label={`Edit draft of ${policy.name}`}
                    >
                      Edit draft
                      <Icon name="arrow-right" size={13} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="secpol-action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewDetails(policy)
                      }}
                      aria-label={`Manage ${policy.name}`}
                    >
                      Manage
                      <Icon name="arrow-right" size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default PoliciesTable
