import type { TeamSecurityOverview } from '../types/dashboard'
import { DashboardIcon } from './DashboardIcon'

interface TeamSecurityOverviewCardProps {
  overview: TeamSecurityOverview
}

export function TeamSecurityOverviewCard({ overview }: TeamSecurityOverviewCardProps) {
  return (
    <section className="dashboard-card security-overview-card" aria-label="Team Security Overview">
      <div className="security-overview-card__header">
        <h2 className="security-overview-card__title">Team Security Overview</h2>
        <div className="security-overview-card__shield" aria-hidden="true">
          <DashboardIcon name="shield-check" size={22} strokeWidth={2} />
        </div>
      </div>

      <div className="security-overview-card__compliance">
        <span className="security-overview-card__compliance-label">Team compliance</span>
        <span className="security-overview-card__compliance-value">
          {overview.compliancePercentage}%
        </span>
      </div>

      <div
        className="security-overview-card__progress-track"
        role="progressbar"
        aria-label="Team compliance progress"
        aria-valuenow={overview.compliancePercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="security-overview-card__progress-fill"
          style={{ width: `${overview.compliancePercentage}%` }}
        />
      </div>

      <div className="security-overview-card__members">
        <DashboardIcon name="users" size={18} strokeWidth={2} />
        <span className="security-overview-card__members-text">
          {overview.totalMembers} team members
        </span>
      </div>

      <div className="security-overview-card__devices">
        <span className="security-overview-card__device-item security-overview-card__device-item--compliant">
          <span className="bullet-dot bullet-dot--green" aria-hidden="true" />
          {overview.compliantDevicesCount} compliant devices
        </span>
        <span className="security-overview-card__device-item security-overview-card__device-item--attention">
          <span className="bullet-dot bullet-dot--amber" aria-hidden="true" />
          {overview.attentionDevicesCount} devices requiring attention
        </span>
      </div>

      <div className="security-overview-card__footer">
        <span>Last assessed 24 Oct 2026 at 09:00 UTC</span>
      </div>
    </section>
  )
}

