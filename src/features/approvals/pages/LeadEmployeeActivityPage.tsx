import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApprovalIcon } from '../components/ApprovalIcon'
import { LeadBottomNav } from '../components/LeadBottomNav'
import { mockEmployeeActivity } from '../data/mockEmployeeActivity'
import type { EmployeeAccessActivityEvent } from '../types/employeeActivity'
import '../styles/approvalInbox.css'
import '../styles/employeeActivity.css'

export default function LeadEmployeeActivityPage() {
  const [events] = useState<EmployeeAccessActivityEvent[]>(mockEmployeeActivity)

  // Filters state
  const [search, setSearch] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')

  // Pagination state - 6 items per page as shown in Figma
  const [page, setPage] = useState(1)
  const pageSize = 6

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (eventTypeFilter === 'blocked' && ev.result !== 'Blocked') return false
      if (eventTypeFilter === 'allowed' && ev.result !== 'Allowed') return false

      if (search.trim()) {
        const query = search.toLowerCase()
        const matchName = ev.employeeName.toLowerCase().includes(query)
        const matchRes = ev.resourceName.toLowerCase().includes(query)
        const matchEv = ev.event.toLowerCase().includes(query)
        const matchDevice = ev.deviceName?.toLowerCase().includes(query) ?? false
        if (!matchName && !matchRes && !matchEv && !matchDevice) return false
      }

      return true
    })
  }, [events, search, eventTypeFilter])

  // Paginated events
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize))
  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredEvents.slice(start, start + pageSize)
  }, [filteredEvents, page, pageSize])

  const startRecord = filteredEvents.length === 0 ? 0 : (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, filteredEvents.length)

  return (
    <main className="approval-page">
      <a className="sr-only" href="#activity-content">
        Skip to main content
      </a>

      {/* Brand Header */}
      <header className="approval-brand-header">
        <Link to="/lead/dashboard">
          <img
            src="/assets/brainmint-logo.png"
            alt="BrainMint — Guiding You to a World of Education"
          />
        </Link>
      </header>

      <div className="approval-content" id="activity-content">
        {/* Page Header */}
        <header className="approval-page-header">
          <div>
            <h1>Employee Access Activity</h1>
            <p>
              Monitor resource access for your Data &amp; Insights team without exposing protected resource contents.
            </p>
          </div>
          <button
            type="button"
            className="approval-export-btn"
            onClick={() => alert('Exporting team access activity log...')}
          >
            <ApprovalIcon name="save" size={16} />
            <span>Export activity</span>
          </button>
        </header>

        {/* 4 Summary Stat Cards */}
        <section className="approval-summary" aria-label="Employee Access Activity summary">
          <article className="approval-summary-card">
            <span>Active team members</span>
            <strong>22 / 24</strong>
            <small>2 offline today</small>
          </article>

          <article className="approval-summary-card">
            <span>Resource sessions</span>
            <strong>146</strong>
            <small>Past 24 hours</small>
          </article>

          <article className="approval-summary-card">
            <span>Blocked attempts</span>
            <strong>03</strong>
            <small>Failed posture or policy</small>
          </article>

          <article className="approval-summary-card">
            <span>Access expiring soon</span>
            <strong>04</strong>
            <small>Within next 48 hours</small>
          </article>
        </section>

        {/* Main Card: Team access events */}
        <section className="approval-card" aria-label="Team access events table">
          <div className="approval-card-title-group">
            <h2 className="approval-card-title">Team access events</h2>
            <p className="approval-card-subtitle">
              Today · Metadata only · Latest first
            </p>
          </div>

          {/* Filter Bar */}
          <div className="approval-filter-bar">
            <div className="approval-filter-left">
              <div className="approval-search-box">
                <span className="approval-search-icon" aria-hidden="true">
                  <ApprovalIcon name="search" size={16} />
                </span>
                <input
                  type="search"
                  placeholder="Search by employee or resource..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  aria-label="Search by employee or resource"
                />
              </div>

              <button
                type="button"
                className="approval-dropdown-btn"
                onClick={() => {
                  setEventTypeFilter((prev) =>
                    prev === 'all' ? 'blocked' : prev === 'blocked' ? 'allowed' : 'all'
                  )
                  setPage(1)
                }}
              >
                <ApprovalIcon name="sliders" size={15} />
                <span>
                  {eventTypeFilter === 'all'
                    ? 'All event types'
                    : eventTypeFilter === 'blocked'
                    ? 'Blocked events'
                    : 'Allowed events'}
                </span>
              </button>
            </div>

            <div className="approval-date-pill">
              <ApprovalIcon name="calendar" size={15} />
              <span>24 Oct 2026</span>
            </div>
          </div>

          {/* Table */}
          <table className="approval-new-table">
            <thead>
              <tr>
                <th scope="col">EMPLOYEE</th>
                <th scope="col">RESOURCE</th>
                <th scope="col">EVENT</th>
                <th scope="col">DEVICE</th>
                <th scope="col">RESULT</th>
                <th scope="col">TIME</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No access events found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((ev) => {
                  const initials = ev.employeeName
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                  const isBlocked = ev.result === 'Blocked' || ev.status === 'Denied'

                  return (
                    <tr key={ev.id}>
                      <td>
                        <div className="approval-table-user">
                          <div className="approval-table-avatar">{initials}</div>
                          <div className="approval-table-user-info">
                            <span className="approval-table-user-name">{ev.employeeName}</span>
                            <span className="approval-table-user-sub">
                              {ev.employeeId || 'EMP-1036'} · {ev.department}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="approval-table-user-info">
                          <span className="approval-table-user-name">{ev.resourceName}</span>
                          <span className="approval-table-user-sub">{ev.resourceDescription}</span>
                        </div>
                      </td>
                      <td>
                        <span className="activity-event-text">{ev.event}</span>
                      </td>
                      <td>
                        <div className="approval-table-user-info">
                          <span className="approval-table-user-name">{ev.deviceName || 'MBP-MAC-01'}</span>
                          <span className="approval-table-user-sub">{ev.osInfo || 'macOS 15.6'}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`activity-badge ${
                            isBlocked ? 'activity-badge--blocked' : 'activity-badge--allowed'
                          }`}
                        >
                          <span className="activity-badge__dot" />
                          {isBlocked ? 'Blocked' : 'Allowed'}
                        </span>
                      </td>
                      <td>
                        <span className="activity-time-text">{ev.timeText || '10:14 UTC'}</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="approval-pagination">
            <span>
              Showing {startRecord} to {endRecord} of {filteredEvents.length} events
            </span>

            <div className="approval-pagination-controls">
              <button
                type="button"
                className="approval-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`approval-page-btn ${p === page ? 'approval-page-btn--active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                className="approval-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Bottom Nav */}
      <LeadBottomNav activeId="activity" />
    </main>
  )
}
