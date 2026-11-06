import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardIcon } from '../components/DashboardIcon'
import { DashboardSummaryCards } from '../components/DashboardSummaryCards'
import { PendingRequestsCard } from '../components/PendingRequestsCard'
import { RecentTeamActivityCard } from '../components/RecentTeamActivityCard'
import { TeamSecurityOverviewCard } from '../components/TeamSecurityOverviewCard'
import { getDashboardData } from '../services/dashboardApi'
import type { DashboardData } from '../types/dashboard'
import '../styles/teamLeadDashboard.css'

export default function TeamLeadDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    try {
      const result = await getDashboardData()
      setData(result)
    } catch {
      setError('Unable to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return (
    <div className="dashboard-page">
      <a className="dashboard-skip-link" href="#dashboard-content">
        Skip to main content
      </a>

      <header className="dashboard-brand-header">
        <img
          className="dashboard-brand-logo"
          src="/assets/brainmint-logo.png"
          alt="BrainMint — Guiding You to a World of Education"
        />
      </header>

      <main className="dashboard-content" id="dashboard-content">
        <header className="dashboard-page-header">
          <div>
            <h1>Team Lead Dashboard</h1>
            <p className="dashboard-page-subtitle">
              Monitor team access, review requests, and track security compliance.
            </p>
          </div>
          <div className="dashboard-page-tools">
            {data && <span className="dashboard-data-source-label">{data.dataSource}</span>}
            <button
              type="button"
              className="dashboard-refresh-button"
              onClick={() => void fetchData(true)}
              disabled={loading || refreshing}
              aria-label="Refresh dashboard data"
              title="Refresh dashboard data"
            >
              <DashboardIcon
                name="refresh"
                size={16}
                className={refreshing ? 'icon-spin' : undefined}
              />
            </button>
          </div>
        </header>

        {error && (
          <section className="dashboard-feedback-panel" role="alert">
            <DashboardIcon name="alert-triangle" size={24} />
            <div>
              <h2 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>Error loading dashboard</h2>
              <p style={{ margin: 0, fontSize: '0.8125rem' }}>{error}</p>
            </div>
            <button
              type="button"
              className="button"
              style={{ marginLeft: 'auto', border: '1px solid #d6c8df', background: '#fff5f5' }}
              onClick={() => void fetchData(true)}
            >
              Try again
            </button>
          </section>
        )}

        {loading && !data && (
          <div className="dashboard-skeleton" aria-busy="true" aria-label="Loading dashboard">
            <div className="dashboard-summary">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="dashboard-summary-card">
                  <div className="dashboard-summary-card__copy" style={{ width: '60%' }}>
                    <span className="dashboard-skeleton-line" style={{ width: '70%', height: '0.75rem', marginBottom: '0.5rem' }} />
                    <span className="dashboard-skeleton-line" style={{ width: '40%', height: '1.75rem', marginBottom: '0.25rem' }} />
                    <span className="dashboard-skeleton-line" style={{ width: '90%', height: '0.625rem' }} />
                  </div>
                  <div className="dashboard-summary-card__icon" style={{ background: '#f5edf5' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {data && (
          <>
            <DashboardSummaryCards summary={data.summary} />
            <PendingRequestsCard requests={data.pendingRequests} />
            <div className="dashboard-bottom-grid">
              <TeamSecurityOverviewCard overview={data.securityOverview} />
              <RecentTeamActivityCard
                activity={data.recentActivity}
                activityDate={data.activityDate}
              />
            </div>
          </>
        )}
      </main>

      {/* Floating Bottom Navigation Dock matching Figma/reference */}
      <nav className="dashboard-bottom-nav" aria-label="Primary navigation">
        <Link
          className="dashboard-bottom-nav__active"
          to="/lead/dashboard"
          aria-current="page"
          aria-label="Dashboard"
        >
          <DashboardIcon name="home" size={29} strokeWidth={1.8} />
        </Link>
        <button
          type="button"
          disabled
          aria-label="Devices (not available yet)"
          title="Devices — not implemented in this workspace"
        >
          <DashboardIcon name="monitor" size={29} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          disabled
          aria-label="Request access (not available yet)"
          title="Request access — not implemented in this workspace"
        >
          <DashboardIcon name="plus" size={29} strokeWidth={1.8} />
        </button>
        <Link to="/lead/approvals" aria-label="Access requests">
          <DashboardIcon name="clipboard" size={29} strokeWidth={1.8} />
        </Link>
        <Link to="/lead/notifications" aria-label="Notifications">
          <DashboardIcon name="bell" size={29} strokeWidth={1.8} />
        </Link>
        <button
          type="button"
          disabled
          aria-label="Profile (not available yet)"
          title="Profile — not implemented in this workspace"
        >
          <DashboardIcon name="user" size={29} strokeWidth={1.8} />
        </button>
      </nav>
    </div>
  )
}
export { TeamLeadDashboardPage }
