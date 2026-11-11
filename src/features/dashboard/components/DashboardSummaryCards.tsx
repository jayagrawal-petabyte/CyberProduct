import { Link } from 'react-router-dom'
import type { DashboardSummary } from '../types/dashboard'
import { DashboardIcon } from './DashboardIcon'

interface DashboardSummaryCardsProps {
  summary: DashboardSummary
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  return (
    <section className="dashboard-summary" aria-label="Team Lead summary statistics">
      <Link
        to="/lead/approvals?status=pending"
        className="dashboard-summary-card dashboard-summary-card--interactive dashboard-summary-card--amber"
        aria-label={`Pending Approvals: ${summary.pendingApprovalsCount}, awaiting your review`}
      >
        <div className="dashboard-summary-card__copy">
          <span className="dashboard-summary-card__label">Pending Approvals</span>
          <span className="dashboard-summary-card__value">{summary.pendingApprovalsCount}</span>
          <span className="dashboard-summary-card__detail">Awaiting your review</span>
        </div>
        <div className="dashboard-summary-card__icon" aria-hidden="true">
          <DashboardIcon name="clock" size={20} strokeWidth={2} />
        </div>
      </Link>

      <Link
        to="/lead/approvals?status=approved"
        className="dashboard-summary-card dashboard-summary-card--interactive dashboard-summary-card--green"
        aria-label={`Approved Requests: ${summary.approvedRequestsCount}, approved this month`}
      >
        <div className="dashboard-summary-card__copy">
          <span className="dashboard-summary-card__label">Approved Requests</span>
          <span className="dashboard-summary-card__value">{summary.approvedRequestsCount}</span>
          <span className="dashboard-summary-card__detail">Approved this month</span>
        </div>
        <div className="dashboard-summary-card__icon" aria-hidden="true">
          <DashboardIcon name="check" size={20} strokeWidth={2} />
        </div>
      </Link>

      <Link
        to="/lead/approvals?status=rejected"
        className="dashboard-summary-card dashboard-summary-card--interactive dashboard-summary-card--red"
        aria-label={`Rejected Requests: ${summary.rejectedRequestsCount}, rejected this month`}
      >
        <div className="dashboard-summary-card__copy">
          <span className="dashboard-summary-card__label">Rejected Requests</span>
          <span className="dashboard-summary-card__value">{summary.rejectedRequestsCount}</span>
          <span className="dashboard-summary-card__detail">Rejected this month</span>
        </div>
        <div className="dashboard-summary-card__icon" aria-hidden="true">
          <DashboardIcon name="x" size={20} strokeWidth={2} />
        </div>
      </Link>

      <div
        className="dashboard-summary-card dashboard-summary-card--blue"
        tabIndex={0}
        role="region"
        aria-label={`Team Members: ${summary.teamMembersCount}, in your managed team`}
      >
        <div className="dashboard-summary-card__copy">
          <span className="dashboard-summary-card__label">Team Members</span>
          <span className="dashboard-summary-card__value">{summary.teamMembersCount}</span>
          <span className="dashboard-summary-card__detail">In your managed team</span>
        </div>
        <div className="dashboard-summary-card__icon" aria-hidden="true">
          <DashboardIcon name="users" size={20} strokeWidth={2} />
        </div>
      </div>
    </section>
  )
}

