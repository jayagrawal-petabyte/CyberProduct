import { Link } from 'react-router-dom'
import type { RecentActivityItem } from '../types/dashboard'
import { DashboardIcon } from './DashboardIcon'

interface RecentTeamActivityCardProps {
  activity: RecentActivityItem[]
  activityDate: string
}

function renderActivityIcon(type: RecentActivityItem['type']) {
  switch (type) {
    case 'request_submitted':
      return (
        <div className="activity-item__icon activity-item__icon--blue" aria-hidden="true">
          <DashboardIcon name="file-text" size={18} strokeWidth={2} />
        </div>
      )
    case 'request_approved':
      return (
        <div className="activity-item__icon activity-item__icon--green" aria-hidden="true">
          <DashboardIcon name="check" size={18} strokeWidth={2} />
        </div>
      )
    case 'compliance_alert':
      return (
        <div className="activity-item__icon activity-item__icon--amber" aria-hidden="true">
          <DashboardIcon name="alert-triangle" size={18} strokeWidth={2} />
        </div>
      )
  }
}

export function RecentTeamActivityCard({ activity, activityDate }: RecentTeamActivityCardProps) {
  return (
    <section className="dashboard-card recent-activity-card" aria-label="Recent Team Activity">
      <div className="recent-activity-card__header">
        <h2 className="recent-activity-card__title">Recent Team Activity</h2>
        <span className="recent-activity-card__date">{activityDate}</span>
      </div>

      <ul className="recent-activity-card__list" aria-label="List of recent team activities">
        {activity.map((item) => (
          <li className="activity-item" key={item.id}>
            {renderActivityIcon(item.type)}
            <div className="activity-item__content">
              <span className="activity-item__title">{item.title}</span>
              <span className="activity-item__description">{item.description}</span>
            </div>
            <time className="activity-item__time" dateTime={item.timestamp}>
              {item.time}
            </time>
          </li>
        ))}
      </ul>

      <div className="recent-activity-card__footer">
        <span className="recent-activity-card__quick-actions-label">Quick Actions</span>
        <div className="recent-activity-card__actions-group">
          <Link
            to="/lead/approvals"
            className="button button--primary-dark"
            aria-label="Review Access Requests"
          >
            Review Access Requests
          </Link>
          <Link
            to="/lead/approvals?status=approved"
            className="button button--peach"
            aria-label="View Approval History"
          >
            View Approval History
          </Link>
        </div>
      </div>
    </section>
  )
}

