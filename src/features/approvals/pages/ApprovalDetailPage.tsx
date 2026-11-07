import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ApprovalIcon } from '../components/ApprovalIcon'
import { RequestStatusBadge } from '../components/RequestStatusBadge'
import { LeadBottomNav } from '../components/LeadBottomNav'
import {
  getApprovalRequestById,
  updateApprovalDecision,
} from '../services/approvalRequestsApi'
import type { ApprovalRequest } from '../types/approvalRequest'
import '../styles/approvalInbox.css'
import '../styles/approvalDetail.css'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

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

  return (
    <main className="approval-page">
      <header className="approval-brand-header">
        <Link to="/lead/dashboard">
          <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        </Link>
      </header>

      <div className="approval-content">
        {/* Breadcrumb Navigation */}
        <nav className="approval-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/lead/dashboard">Team Lead Workspace</Link>
          <span className="approval-breadcrumbs__separator">&gt;</span>
          <Link to={basePath}>Access Requests</Link>
          <span className="approval-breadcrumbs__separator">&gt;</span>
          <span aria-current="page">Request Details</span>
        </nav>

        {/* Page Header */}
        <header className="approval-page-header">
          <div>
            <h1>Request Details</h1>
            <p>Review the access request and make an informed approval decision.</p>
          </div>
        </header>

        {feedback && (
          <div
            className={`approval-feedback-banner approval-feedback-banner--${feedback.type}`}
            role="status"
          >
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
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
            {/* Card 1: Request Summary */}
            <section className="request-summary-card" aria-label="Request Summary">
              <div className="request-summary-card__left">
                <div className="request-summary-card__icon">
                  <ApprovalIcon name="clipboard" size={24} />
                </div>
                <h2 className="request-summary-card__title">Request Summary</h2>
              </div>

              <div className="request-summary-card__field">
                <span>Request ID</span>
                <strong>{request.id}</strong>
              </div>

              <div className="request-summary-card__field">
                <span>Status</span>
                <RequestStatusBadge status={request.status} />
              </div>

              <div className="request-summary-card__field">
                <span>Submitted</span>
                <strong>{dateFormatter.format(new Date(request.requestedAt))}</strong>
              </div>
            </section>

            {/* 2-column detail grid */}
            <div className="request-detail-grid">
              {/* Left Panel: Employee Info & Requested Access */}
              <section className="request-detail-panel" aria-label="Employee Information">
                <div className="request-detail-panel__header">
                  <h3 className="request-detail-panel__title">
                    <ApprovalIcon name="user" size={18} />
                    Employee Information
                  </h3>
                </div>

                <div className="request-info-fields">
                  <div className="request-info-field">
                    <span className="request-info-field__label">Employee</span>
                    <strong className="request-info-field__value">{request.employeeName}</strong>
                  </div>
                  <div className="request-info-field">
                    <span className="request-info-field__label">Department</span>
                    <strong className="request-info-field__value">{request.department ?? 'Engineering'}</strong>
                  </div>
                  <div className="request-info-field">
                    <span className="request-info-field__label">Role</span>
                    <strong className="request-info-field__value">{request.role ?? 'Software Engineer'}</strong>
                  </div>
                  <div className="request-info-field">
                    <span className="request-info-field__label">Manager</span>
                    <strong className="request-info-field__value">{request.manager ?? 'Alex Morgan'}</strong>
                  </div>
                </div>

                <hr className="request-detail-panel__divider" />

                <div className="request-detail-panel__header">
                  <h3 className="request-detail-panel__title">
                    <ApprovalIcon name="key" size={18} />
                    Requested Access
                  </h3>
                </div>

                <div className="request-info-fields request-info-fields--3col">
                  <div className="request-info-field">
                    <span className="request-info-field__label">Resource</span>
                    <strong className="request-info-field__value">{request.resourceName}</strong>
                  </div>
                  <div className="request-info-field">
                    <span className="request-info-field__label">Requested Access Level</span>
                    <strong className="request-info-field__value">{request.accessLevel ?? 'Read and Write'}</strong>
                  </div>
                  <div className="request-info-field">
                    <span className="request-info-field__label">Requested Duration</span>
                    <strong className="request-info-field__value">{request.duration ?? '30 days'}</strong>
                  </div>
                </div>

                <div className="request-justification">
                  <span className="request-justification__label">Business Justification</span>
                  <p className="request-justification__text">
                    {request.businessJustification ?? 'Access needed to contribute to assigned objectives.'}
                  </p>
                </div>
              </section>

              {/* Right Panel: Security Review */}
              <section className="request-detail-panel" aria-label="Security Review">
                <div className="request-detail-panel__header">
                  <h3 className="request-detail-panel__title">
                    <ApprovalIcon name="shield-check" size={18} />
                    Security Review
                  </h3>
                  <span className="security-review-badge">Ready for Review</span>
                </div>

                <div className="security-review-list">
                  <div className="security-review-item">
                    <div className="security-review-item__label">
                      <span className="security-review-item__icon">
                        <ApprovalIcon name="check-circle" size={18} />
                      </span>
                      <span>Multi-factor authentication</span>
                    </div>
                    <span className="security-review-item__value">{request.mfaStatus ?? 'Enabled'}</span>
                  </div>

                  <div className="security-review-item">
                    <div className="security-review-item__label">
                      <span className="security-review-item__icon">
                        <ApprovalIcon name="check-circle" size={18} />
                      </span>
                      <span>Device compliance</span>
                    </div>
                    <span className="security-review-item__value">{request.deviceCompliance ?? 'Compliant'}</span>
                  </div>

                  <div className="security-review-item">
                    <div className="security-review-item__label">
                      <span className="security-review-item__icon">
                        <ApprovalIcon name="check-circle" size={18} />
                      </span>
                      <span>Policy check</span>
                    </div>
                    <span className="security-review-item__value">{request.policyCheck ?? 'Passed'}</span>
                  </div>
                </div>

                <p className="security-review-note">
                  Sample checks shown for illustration only—not a live security assessment.
                </p>
              </section>
            </div>

            {/* Card 3: Approval Notes */}
            <section className="approval-notes-card" aria-label="Approval Notes">
              <div className="approval-notes-card__header">
                <h3 className="approval-notes-card__title">Approval Notes</h3>
                <span className="approval-notes-card__optional">(optional)</span>
              </div>
              <p className="approval-notes-card__subtitle">Comments or decision notes</p>
              <textarea
                className="approval-notes-card__textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context for your decision, any conditions, or a reason for rejecting this request..."
                rows={3}
              />
            </section>

            {/* Bottom Action Bar */}
            <div className="approval-action-bar">
              <Link to={basePath} className="approval-back-btn">
                <ApprovalIcon name="arrow-left" size={16} />
                Back to Requests
              </Link>

              <div className="approval-decision-actions">
                <span
                  className={`approval-decision-status ${
                    !isPending ? 'approval-decision-status--decided' : ''
                  }`}
                >
                  {isApproved
                    ? 'Request has been approved.'
                    : isRejected
                    ? 'Request has been rejected.'
                    : 'No decision has been made.'}
                </span>

                <button
                  type="button"
                  className="approval-btn-reject"
                  onClick={() => setModalAction('reject')}
                  disabled={processing}
                >
                  <ApprovalIcon name="x" size={16} />
                  Reject Request
                </button>

                <button
                  type="button"
                  className="approval-btn-approve"
                  onClick={() => setModalAction('approve')}
                  disabled={processing}
                >
                  <ApprovalIcon name="check" size={16} />
                  Approve Request
                </button>
              </div>
            </div>
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
                className={`approval-modal__btn-confirm ${
                  modalAction === 'approve'
                    ? 'approval-modal__btn-confirm--approve'
                    : 'approval-modal__btn-confirm--reject'
                }`}
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
      <LeadBottomNav />
    </main>
  )
}
