import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ApprovalIcon } from '../components/ApprovalIcon'
import { LeadBottomNav } from '../components/LeadBottomNav'
import {
  getApprovalRequestById,
  updateApprovalDecision,
} from '../services/approvalRequestsApi'
import type { ApprovalRequest } from '../types/approvalRequest'
import '../styles/approvalInbox.css'
import '../styles/approvalDetail.css'

export default function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/lead/') ? '/lead/approvals' : '/approvals'

  const [request, setRequest] = useState<ApprovalRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null)
  const [processing, setProcessing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    async function loadRequest() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await getApprovalRequestById(id)
        if (isMounted) {
          setRequest(data)
          if (data?.decisionNotes) {
            setNotes(data.decisionNotes)
          }
        }
      } catch {
        if (isMounted) {
          setError('Unable to load request details.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    void loadRequest()
    return () => {
      isMounted = false
    }
  }, [id])

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!request) return
    setProcessing(true)
    setFeedback(null)
    try {
      const updated = await updateApprovalDecision(request.id, decision, notes)
      setRequest(updated)
      setFeedback({
        type: 'success',
        message: `Request ${request.id} has been ${decision} successfully.`,
      })
      setModalAction(null)
    } catch {
      setFeedback({
        type: 'error',
        message: `Failed to update request. Please try again.`,
      })
    } finally {
      setProcessing(false)
    }
  }

  const isPending = request?.status.toLowerCase() === 'pending'
  const isApproved = request?.status.toLowerCase() === 'approved'
  const isRejected = request?.status.toLowerCase() === 'rejected'

  const employeeInitials = request?.employeeName
    ? request.employeeName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'MC'

  return (
    <main className="approval-page">
      <header className="approval-brand-header">
        <Link to="/lead/dashboard">
          <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        </Link>
      </header>

      <div className="approval-content">
        {/* Back Button */}
        <Link to={basePath} className="approval-back-nav-btn">
          <ApprovalIcon name="arrow-left" size={15} />
          <span>Back to Access Requests</span>
        </Link>

        {feedback && (
          <div
            className={`approval-feedback-banner approval-feedback-banner--${feedback.type}`}
            role="status"
          >
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'inherit' }}
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="approval-state" role="status">
            <ApprovalIcon name="refresh" size={32} />
            <h2>Loading request details...</h2>
          </div>
        ) : error || !request ? (
          <div className="approval-state" role="alert">
            <ApprovalIcon name="x-circle" size={36} />
            <h2>Request not found</h2>
            <p>No request matching identifier &quot;{id}&quot; was found.</p>
            <Link to={basePath} className="approval-back-btn">
              <ApprovalIcon name="arrow-left" size={16} />
              Back to Access Requests
            </Link>
          </div>
        ) : (
          <div className="approval-detail-view">
            {/* Header: Title & Meta badges */}
            <div className="detail-header-row">
              <div className="detail-header-left">
                <h1 className="detail-resource-title">{request.resourceName}</h1>
                <div className="detail-header-meta">
                  <span className="detail-meta-pill">{request.id}</span>
                  <span>·</span>
                  <span>{request.department || 'Data & Insights'}</span>
                  <span>·</span>
                  <span className="detail-meta-pill">{request.accessLevel || 'Read-only'}</span>
                  <span>·</span>
                  <span className={`detail-status-pill detail-status-pill--${request.status.toLowerCase()}`}>
                    <span className="detail-status-pill__dot" />
                    {request.status.toLowerCase() === 'pending'
                      ? 'Pending review'
                      : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="detail-sla-badge">
                <ApprovalIcon name="clock" size={15} />
                <span>Review SLA: 3h 12m remaining</span>
              </div>
            </div>

            {/* Card 1: Resource details & Employee */}
            <section className="detail-main-card" aria-label="Resource and employee details">
              <div className="detail-employee-box">
                <div className="detail-employee-avatar">{employeeInitials}</div>
                <div className="detail-employee-info">
                  <div className="detail-employee-name">{request.employeeName}</div>
                  <div className="detail-employee-subtext">
                    {request.role || 'Product Analyst'} · {request.department || 'Data & Insights'} · {request.employeeId || 'EMP-1042'} · {request.employeeEmail || `${request.employeeName.toLowerCase().replace(/\s+/g, '.')}@acme.com`}
                  </div>
                </div>
              </div>

              <div className="detail-fields-grid">
                <div className="detail-field">
                  <span className="detail-field-label">Resource owner</span>
                  <span className="detail-field-value">{request.resourceOwner || 'Elena Rossi · Data Platform'}</span>
                </div>

                <div className="detail-field">
                  <span className="detail-field-label">Project reference</span>
                  <span className="detail-field-value">{request.projectReference || 'DATA-482 · Q4 revenue validation'}</span>
                </div>

                <div className="detail-field">
                  <span className="detail-field-label">Requested permission</span>
                  <span className="detail-field-value">{request.requestedPermission || `${request.accessLevel || 'Read-only'} · Curated analytics views`}</span>
                </div>

                <div className="detail-field">
                  <span className="detail-field-label">Expiration</span>
                  <span className="detail-field-value">{request.expiration || 'Automatically, 7 days after approval'}</span>
                </div>
              </div>

              <div className="detail-business-reason-box">
                <h3 className="detail-business-reason-title">Business reason</h3>
                <p className="detail-business-reason-text">
                  &ldquo;{request.businessJustification || 'I need read-only access to validate Q4 revenue metrics for the Finance reporting review. Access is required to reconcile dashboard totals against the analytics warehouse.'}&rdquo;
                </p>
              </div>
            </section>

            {/* Card 2: Device & compliance */}
            <section className="detail-main-card" aria-label="Device and compliance">
              <div className="detail-card-header">
                <h2 className="detail-card-title">Device &amp; compliance</h2>
                <p className="detail-card-subtitle">
                  {request.deviceInfo || 'MBP-MCHEN-01 · MacBook Pro 14"'} · {request.osInfo || 'macOS 15.6 · Managed by Jamf'}
                </p>
              </div>

              <div className="detail-pills-row">
                <span className="detail-feature-pill">
                  <ApprovalIcon name="check" size={13} />
                  <span>FileVault on</span>
                </span>
                <span className="detail-feature-pill">
                  <ApprovalIcon name="check" size={13} />
                  <span>EDR up to date</span>
                </span>
                <span className="detail-feature-pill">
                  <ApprovalIcon name="check" size={13} />
                  <span>MFA verified</span>
                </span>
                <span className="detail-feature-pill">
                  <ApprovalIcon name="check" size={13} />
                  <span>Trusted VPN</span>
                </span>
              </div>

              <p className="detail-compliance-footnote">
                Device compliant with Acme Corp BYOD policy v3.2. Last checked 12m ago.
              </p>
            </section>

            {/* Card 3: Request timeline */}
            <section className="detail-main-card" aria-label="Request timeline">
              <div className="detail-card-header">
                <h2 className="detail-card-title">Request timeline</h2>
              </div>

              <div className="detail-timeline-list">
                <div className="detail-timeline-item">
                  <div className="detail-timeline-left">
                    <span className="detail-timeline-dot" />
                    <div>
                      <div className="detail-timeline-title">Assigned to Daniel Brooks</div>
                      <div className="detail-timeline-desc">Auto-routed via team lead rule for Data &amp; Insights</div>
                    </div>
                  </div>
                  <span className="detail-timeline-time">09:18 UTC</span>
                </div>

                <div className="detail-timeline-item">
                  <div className="detail-timeline-left">
                    <span className="detail-timeline-dot" />
                    <div>
                      <div className="detail-timeline-title">Request submitted by {request.employeeName}</div>
                      <div className="detail-timeline-desc">Via BrainMint Web Portal</div>
                    </div>
                  </div>
                  <span className="detail-timeline-time">09:18 UTC</span>
                </div>
              </div>
            </section>

            {/* Card 4: Policy signals */}
            <section className="detail-main-card" aria-label="Policy signals">
              <div className="detail-card-header">
                <h2 className="detail-card-title">Policy signals</h2>
              </div>

              <div className="detail-signals-list">
                <div className="detail-signal-item">
                  <span className="detail-signal-icon--green">
                    <ApprovalIcon name="check-circle" size={16} />
                  </span>
                  <div className="detail-signal-text">
                    <span className="detail-signal-title">Least-privilege scope</span>
                    <span className="detail-signal-desc">Requested role matches standard Data &amp; Insights analyst profile.</span>
                  </div>
                </div>

                <div className="detail-signal-item">
                  <span className="detail-signal-icon--green">
                    <ApprovalIcon name="check-circle" size={16} />
                  </span>
                  <div className="detail-signal-text">
                    <span className="detail-signal-title">Duration within policy</span>
                    <span className="detail-signal-desc">7-day window is well within the 30-day max for analytics read.</span>
                  </div>
                </div>

                <div className="detail-signal-item">
                  <span className="detail-signal-icon--green">
                    <ApprovalIcon name="check-circle" size={16} />
                  </span>
                  <div className="detail-signal-text">
                    <span className="detail-signal-title">No conflicting access</span>
                    <span className="detail-signal-desc">No segregation-of-duties violations detected.</span>
                  </div>
                </div>

                <div className="detail-signal-item">
                  <span className="detail-signal-icon--amber">
                    <ApprovalIcon name="shield-alert" size={16} />
                  </span>
                  <div className="detail-signal-text">
                    <span className="detail-signal-title">Manager decision required</span>
                    <span className="detail-signal-desc">Resource snowflake-analytics requires explicit lead sign-off.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Card 5: Your decision */}
            <section className="detail-decision-card" aria-label="Your decision">
              <div className="detail-card-header">
                <h2 className="detail-card-title">Your decision</h2>
                <p className="detail-card-subtitle">
                  Recorded in immutable audit log as Daniel Brooks (EMP-1008)
                </p>
              </div>

              {isPending ? (
                <>
                  <textarea
                    className="detail-decision-textarea"
                    placeholder="Add an optional note explaining your decision..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />

                  <div className="detail-decision-buttons">
                    <button
                      type="button"
                      className="detail-btn-reject"
                      onClick={() => setModalAction('reject')}
                      disabled={processing}
                    >
                      <ApprovalIcon name="x" size={16} />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      className="detail-btn-approve"
                      onClick={() => setModalAction('approve')}
                      disabled={processing}
                    >
                      <ApprovalIcon name="check" size={16} />
                      <span>Approve</span>
                    </button>
                  </div>

                  <p className="detail-decision-footer-note">
                    Decisions cannot be undone once submitted. Your action will be broadcast to the security event bus.
                  </p>
                </>
              ) : (
                <div style={{ padding: '0.5rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className={`detail-status-pill detail-status-pill--${request.status.toLowerCase()}`}>
                      <span className="detail-status-pill__dot" />
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Decided by Daniel Brooks
                    </span>
                  </div>
                  {notes && (
                    <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#334155', fontStyle: 'italic' }}>
                      &ldquo;{notes}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalAction && (
        <div className="approval-modal-backdrop" role="dialog" aria-modal="true">
          <div className="approval-modal">
            <h3 className="approval-modal__title">
              {modalAction === 'approve' ? 'Approve Access Request?' : 'Reject Access Request?'}
            </h3>
            <p className="approval-modal__text">
              {modalAction === 'approve'
                ? `Are you sure you want to approve ${request?.resourceName} access for ${request?.employeeName}?`
                : `Are you sure you want to reject this access request for ${request?.employeeName}?`}
            </p>
            <div className="approval-modal__actions">
              <button
                type="button"
                className="approval-modal__btn-cancel"
                onClick={() => setModalAction(null)}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                className={
                  modalAction === 'approve'
                    ? 'approval-modal__btn-confirm--approve'
                    : 'approval-modal__btn-confirm--reject'
                }
                onClick={() => void handleDecision(modalAction === 'approve' ? 'approved' : 'rejected')}
                disabled={processing}
              >
                {processing ? 'Processing...' : modalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav */}
      <LeadBottomNav activeId="approvals" />
    </main>
  )
}
