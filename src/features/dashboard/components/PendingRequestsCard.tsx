import { Link } from 'react-router-dom'
import type { ApprovalRequest } from '../../approvals/types/approvalRequest'

interface PendingRequestsCardProps {
  requests: ApprovalRequest[]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatRequestDate(isoString: string): { dateStr: string; timeStr: string } {
  try {
    const d = new Date(isoString)
    const day = d.getUTCDate()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[d.getUTCMonth()]
    const year = d.getUTCFullYear()
    const hours = String(d.getUTCHours()).padStart(2, '0')
    const mins = String(d.getUTCMinutes()).padStart(2, '0')
    return {
      dateStr: `${day} ${month} ${year}`,
      timeStr: `${hours}:${mins} UTC`,
    }
  } catch {
    return { dateStr: isoString, timeStr: '' }
  }
}

export function PendingRequestsCard({ requests }: PendingRequestsCardProps) {
  return (
    <section className="dashboard-card pending-requests-card" aria-label="Pending Access Requests">
      <div className="pending-requests-card__header">
        <div className="pending-requests-card__title-group">
          <h2 className="pending-requests-card__title">Pending Access Requests</h2>
          <span className="pending-requests-card__badge" aria-label={`${requests.length} pending requests`}>
            {requests.length}
          </span>
        </div>
        <span className="pending-requests-card__subtitle">All requests awaiting your review</span>
      </div>

      <div className="table-scroll-region" tabIndex={0} role="region" aria-label="Pending requests list">
        {requests.length === 0 ? (
          <div className="empty-requests-state">
            <p>No pending requests awaiting your review.</p>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th scope="col" className="column-employee">Employee</th>
                <th scope="col" className="column-resource">Resource</th>
                <th scope="col" className="column-access">Access Level</th>
                <th scope="col" className="column-date">Request Date</th>
                <th scope="col" className="column-status">Status</th>
                <th scope="col" className="column-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const { dateStr, timeStr } = formatRequestDate(request.requestedAt)
                return (
                  <tr key={request.id}>
                    <td>
                      <div className="employee-cell">
                        <span className="employee-avatar" aria-hidden="true">
                          {getInitials(request.employeeName)}
                        </span>
                        <span>{request.employeeName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="resource-cell">
                        <span>{request.resourceName}</span>
                        {request.resourceDescription && (
                          <small>{request.resourceDescription}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span>{request.accessLevel ?? 'Standard'}</span>
                    </td>
                    <td>
                      <div className="submitted-date">
                        <span>{dateStr}</span>
                        {timeStr && <small>{timeStr}</small>}
                      </div>
                    </td>
                    <td>
                      <span className="status-badge status-badge--pending">
                        <span className="status-badge__dot" aria-hidden="true" />
                        Pending
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/lead/approvals/${request.id}`}
                        className="button button--review-outline"
                        aria-label={`Review request ${request.id} for ${request.employeeName}`}
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
