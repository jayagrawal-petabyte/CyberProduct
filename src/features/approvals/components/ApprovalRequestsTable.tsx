import { Link } from 'react-router-dom'
import type { ApprovalRequest } from '../types/approvalRequest'
import { RequestStatusBadge } from './RequestStatusBadge'

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' })

export function ApprovalRequestsTable({ requests, basePath }: { requests: ApprovalRequest[]; basePath: string }) {
  return <div className="approval-table-scroll" tabIndex={0} role="region" aria-label="Access requests table">
    <table className="approval-table">
      <caption className="sr-only">Employee access requests</caption>
      <thead><tr>
        <th scope="col">Employee</th><th scope="col">Resource</th><th scope="col">Access Level</th>
        <th scope="col">Submitted Date</th><th scope="col">Status</th><th scope="col">Action</th>
      </tr></thead>
      <tbody>{requests.map((request, index) => {
        const date = new Date(request.requestedAt)
        const initials = request.employeeName.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || '?'
        const pending = request.status.trim().toLowerCase() === 'pending'
        return <tr key={request.id}>
          <td><div className="employee-cell"><span className={`employee-avatar employee-avatar--${index % 4}`}>{initials}</span><strong>{request.employeeName}</strong></div></td>
          <td><div className="resource-cell"><strong>{request.resourceName}</strong><small>{request.resourceDescription || 'Not provided'}</small></div></td>
          <td>{request.accessLevel || 'Not provided'}</td>
          <td>{Number.isNaN(date.valueOf()) ? 'Not provided' : <time className="submitted-date" dateTime={request.requestedAt}><span>{dateFormatter.format(date)}</span><small>{timeFormatter.format(date)} UTC</small></time>}</td>
          <td><RequestStatusBadge status={request.status} /></td>
          <td><Link className={pending ? 'review-button' : 'details-link'} to={`${basePath}/${encodeURIComponent(request.id)}`} aria-label={`${pending ? 'Review' : 'View details for'} request ${request.id}`}>{pending ? 'Review' : 'View Details'}</Link></td>
        </tr>
      })}</tbody>
    </table>
  </div>
}
