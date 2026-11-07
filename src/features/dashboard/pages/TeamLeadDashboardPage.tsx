import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LeadBottomNav } from '../../approvals/components/LeadBottomNav'
import { ApprovalIcon } from '../../approvals/components/ApprovalIcon'
import { getDashboardData } from '../services/dashboardApi'
import type { DashboardData } from '../types/dashboard'
import '../styles/teamLeadDashboard.css'

export default function TeamLeadDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getDashboardData()
      setData(result)
    } catch {
      setError('Unable to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return (
    <div className="dashboard-page">
      <a className="sr-only" href="#dashboard-content">
        Skip to main content
      </a>

      {/* Brand Header */}
      <header className="dashboard-brand-header">
        <Link to="/lead/dashboard">
          <img
            className="dashboard-brand-logo"
            src="/assets/brainmint-logo.png"
            alt="BrainMint — Guiding You to a World of Education"
          />
        </Link>
      </header>

      <main className="dashboard-content" id="dashboard-content">
        {/* Page Greeting & Quick Action */}
        <header className="dashboard-page-header">
          <div>
            <h1>Good morning, Daniel</h1>
            <p className="dashboard-page-subtitle">
              Here&apos;s the access picture for your Data &amp; Insights team.
            </p>
          </div>
          <Link to="/lead/approvals" className="dashboard-review-requests-btn">
            <ApprovalIcon name="clipboard" size={16} />
            <span>Review requests</span>
          </Link>
        </header>

        {error && (
          <div className="dashboard-white-card" style={{ marginBottom: '1.25rem', color: '#b91c1c' }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {loading && !data ? (
          <div className="dashboard-summary-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="dashboard-stat-card" style={{ opacity: 0.6 }}>
                <span className="dashboard-stat-card__label">Loading...</span>
                <span className="dashboard-stat-card__value">--</span>
              </div>
            ))}
          </div>
        ) : data ? (
          <>
            {/* 4 Stat Cards */}
            <section className="dashboard-summary-grid" aria-label="Team Lead Summary Metrics">
              <article className="dashboard-stat-card">
                <span className="dashboard-stat-card__label">Awaiting your review</span>
                <span className="dashboard-stat-card__value">{data.summary.pendingCount}</span>
                <span className="dashboard-stat-card__detail">
                  <span className="dashboard-stat-card__detail--amber">2 requests</span> nearing review SLA
                </span>
              </article>

              <article className="dashboard-stat-card">
                <span className="dashboard-stat-card__label">Approved this week</span>
                <span className="dashboard-stat-card__value">{data.summary.approvedWeekCount}</span>
                <span className="dashboard-stat-card__detail">
                  <span className="dashboard-stat-card__detail--green">+4</span> compared with last week
                </span>
              </article>

              <article className="dashboard-stat-card">
                <span className="dashboard-stat-card__label">Average review time</span>
                <span className="dashboard-stat-card__value">{data.summary.avgReviewTime}</span>
                <span className="dashboard-stat-card__detail">
                  <span className="dashboard-stat-card__detail--green">Target:</span> under 4 business hours
                </span>
              </article>

              <article className="dashboard-stat-card">
                <span className="dashboard-stat-card__label">Team members</span>
                <span className="dashboard-stat-card__value">{data.summary.teamMembersCount}</span>
                <span className="dashboard-stat-card__detail">{data.summary.teamName}</span>
              </article>
            </section>

            {/* 2-Column Grid */}
            <div className="dashboard-main-grid">
              {/* Left Column */}
              <div className="dashboard-col">
                {/* Priority requests card */}
                <section className="dashboard-white-card" aria-label="Priority requests">
                  <div className="dashboard-card-header">
                    <div>
                      <h2 className="dashboard-card-title">Priority requests</h2>
                      <p className="dashboard-card-subtitle">Your team only · Oldest first</p>
                    </div>
                    <Link to="/lead/approvals" className="dashboard-card-link">
                      Access Requests →
                    </Link>
                  </div>

                  <table className="priority-requests-table">
                    <thead>
                      <tr>
                        <th scope="col">EMPLOYEE</th>
                        <th scope="col">RESOURCE</th>
                        <th scope="col">SUBMITTED</th>
                        <th scope="col">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.priorityRequests.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <div className="priority-employee-cell">
                              <span className="priority-employee-name">{req.employeeName}</span>
                              <span className="priority-employee-id">{req.id}</span>
                            </div>
                          </td>
                          <td>
                            <span className="priority-resource-cell">{req.resourceName}</span>
                          </td>
                          <td>
                            <span className="priority-submitted-cell">{req.submittedTimeText || 'Today'}</span>
                          </td>
                          <td>
                            <Link
                              to={`/lead/approvals/${req.id}`}
                              className="priority-review-link"
                              aria-label={`Review request ${req.id} for ${req.employeeName}`}
                            >
                              Review →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="priority-table-footer">
                    <span>Showing 3 of 5 pending requests</span>
                    <div className="priority-pagination">
                      <span>← Previous</span>
                      <span className="priority-pagination__active">1</span>
                      <Link to="/lead/approvals">Next →</Link>
                    </div>
                  </div>
                </section>

                {/* Latest decisions card */}
                <section className="dashboard-white-card" aria-label="Latest decisions">
                  <h2 className="dashboard-card-title" style={{ marginBottom: '1rem' }}>
                    Latest decisions
                  </h2>

                  <div className="latest-decision-item">
                    <div className="latest-decision-item__left">
                      <div className="latest-decision-item__icon" aria-hidden="true">
                        <ApprovalIcon name="check" size={16} />
                      </div>
                      <div className="latest-decision-item__text">
                        <span className="latest-decision-item__title">{data.latestDecision.title}</span>
                        <span className="latest-decision-item__subtitle">{data.latestDecision.subtitle}</span>
                      </div>
                    </div>
                    <span className="latest-decision-item__time">{data.latestDecision.time}</span>
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="dashboard-col">
                {/* Request volume bar chart card */}
                <section className="dashboard-white-card" aria-label="Request volume">
                  <div className="dashboard-card-header">
                    <div>
                      <h2 className="dashboard-card-title">Request volume</h2>
                      <p className="dashboard-card-subtitle">18–24 Oct 2026 · Last 7 days</p>
                    </div>
                  </div>

                  <div className="request-volume-legend">
                    <span className="request-volume-legend__item">
                      <span className="request-volume-legend__dot request-volume-legend__dot--approved" />
                      Approved requests
                    </span>
                    <span className="request-volume-legend__item">
                      <span className="request-volume-legend__dot request-volume-legend__dot--submitted" />
                      Submitted requests
                    </span>
                  </div>

                  <div className="request-volume-chart" aria-label="Volume bar chart">
                    {data.requestVolume.map((item) => (
                      <div key={item.day} className="request-volume-chart__col">
                        <div className="request-volume-chart__bars">
                          <div
                            className="request-volume-bar request-volume-bar--approved"
                            style={{ height: `${item.approved}%` }}
                            title={`Approved: ${item.approved}`}
                          />
                          <div
                            className="request-volume-bar request-volume-bar--submitted"
                            style={{ height: `${item.submitted}%` }}
                            title={`Submitted: ${item.submitted}`}
                          />
                        </div>
                        <span className="request-volume-chart__day">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Team activity card */}
                <section className="dashboard-white-card" aria-label="Team activity">
                  <h2 className="dashboard-card-title" style={{ marginBottom: '1rem' }}>
                    Team activity
                  </h2>

                  <div className="team-activity-list">
                    {data.teamActivity.map((act) => (
                      <div key={act.id} className="team-activity-item">
                        <div className="team-activity-item__left">
                          <div
                            className={`team-activity-item__icon ${
                              act.icon === 'key'
                                ? 'team-activity-item__icon--blue'
                                : 'team-activity-item__icon--orange'
                            }`}
                            aria-hidden="true"
                          >
                            <ApprovalIcon name={act.icon} size={16} />
                          </div>
                          <div className="team-activity-item__text">
                            <span className="team-activity-item__title">{act.title}</span>
                            <span className="team-activity-item__desc">{act.description}</span>
                          </div>
                        </div>
                        <span className="team-activity-item__time">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </>
        ) : null}
      </main>

      {/* Floating Bottom Nav */}
      <LeadBottomNav activeId="dashboard" />
    </div>
  )
}
export { TeamLeadDashboardPage }
