import type { ApprovalRequestStatus } from '../types/approvalRequest'
import { getStatusLabel } from '../utils/approvalRequestFilters'

export function RequestStatusBadge({ status }: { status: ApprovalRequestStatus }) {
  const normalizedStatus = status.trim().toLowerCase()
  const statusClass = ['pending', 'approved', 'rejected'].includes(normalizedStatus) ? normalizedStatus : 'unknown'
  return <span className={`approval-status approval-status--${statusClass}`}>
    <span className="approval-status__dot" aria-hidden="true" />{getStatusLabel(status)}
  </span>
}
