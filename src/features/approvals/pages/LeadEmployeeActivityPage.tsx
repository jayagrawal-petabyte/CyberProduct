import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApprovalIcon } from '../components/ApprovalIcon'
import { LeadBottomNav } from '../components/LeadBottomNav'
import { mockEmployeeActivity } from '../data/mockEmployeeActivity'
import type { EmployeeAccessActivityEvent } from '../types/employeeActivity'
import '../styles/approvalInbox.css'
import '../styles/employeeActivity.css'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})
const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
})

export default function LeadEmployeeActivityPage() {
  const [events] = useState<EmployeeAccessActivityEvent[]>(mockEmployeeActivity)

  // Filters state
  const [search, setSearch] = useState('')
  const [eventType, setEventType] = useState('all')
  const [employee, setEmployee] = useState('all')
  const [resource, setResource] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  // Detail Modal state
  const [selectedEvent, setSelectedEvent] = useState<EmployeeAccessActivityEvent | null>(null)

  // Filter options
  const uniqueEmployees = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.employeeName))).sort()
  }, [events])

  const uniqueResources = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.resourceName))).sort()
  }, [events])

  const uniqueEventTypes = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.event))).sort()
  }, [events])

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (eventType !== 'all' && ev.event !== eventType) return false
      if (employee !== 'all' && ev.employeeName !== employee) return false
      if (resource !== 'all' && ev.resourceName !== resource) return false

      if (search.trim()) {
        const query = search.toLowerCase()
        const matchName = ev.employeeName.toLowerCase().includes(query)
        const matchRes = ev.resourceName.toLowerCase().includes(query)
        const matchEv = ev.event.toLowerCase().includes(query)
        if (!matchName && !matchRes && !matchEv) return false
      }

      if (dateRange !== 'all') {
        const evDate = new Date(ev.timestamp).getTime()
        const now = Date.now()
        const dayMs = 24 * 60 * 60 * 1000
        if (dateRange === 'today' && now - evDate > dayMs) return false
        if (dateRange === 'last-7-days' && now - evDate > 7 * dayMs) return false
        if (dateRange === 'last-30-days' && now - evDate > 30 * dayMs) return false
      }

      return true
    })
  }, [events, search, eventType, employee, resource, dateRange])

  // Paginated events
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize))
  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredEvents.slice(start, start + pageSize)
  }, [filteredEvents, page, pageSize])

  const hasActiveFilters =
    search !== '' || eventType !== 'all' || employee !== 'all' || resource !== 'all' || dateRange !== 'all'

  const clearFilters = () => {
    setSearch('')
    setEventType('all')
    setEmployee('all')
    setResource('all')
    setDateRange('all')
    setPage(1)
  }

  const startRecord = filteredEvents.length === 0 ? 0 : (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, filteredEvents.length)

  // Status badge class
  const getStatusClass = (status: EmployeeAccessActivityEvent['status']) => {
    switch (status) {
      case 'Successful':
        return 'activity-status-badge--successful'
      case 'Flagged':
        return 'activity-status-badge--flagged'
      case 'Denied':
        return 'activity-status-badge--denied'
      case 'Pending':
        return 'activity-status-badge--pending'
      case 'Updated':
        return 'activity-status-badge--updated'
      default:
        return ''
    }
  }

  return (
    <main className="approval-page">
      <header className="approval-brand-header">
        <Link to="/lead/dashboard">
          <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        </Link>
      </header>

      <div className="approval-content">
        {/* Page Header */}
        <header className="approval-page-header">
          <div>
            <h1>Employee Access Activity</h1>
            <p>Monitor team access events and employee activity.</p>
          </div>
        </header>

        {/* 4 Summary Cards matching the screenshot */}
        <section className="approval-summary" aria-label="Activity Metrics">
          <article className="approval-summary-card approval-summary-card--purple">
            <div>
              <span>Total Events</span>
              <strong>248</strong>
              <small>Team activity today</small>
            </div>
            <span className="approval-summary-card__icon">
              <ApprovalIcon name="activity" size={22} />
            </span>
          </article>

          <article className="approval-summary-card approval-summary-card--green">
            <div>
              <span>Access Granted</span>
              <strong>186</strong>
              <small>Successful resource access</small>
            </div>
            <span className="approval-summary-card__icon">
              <ApprovalIcon name="check" size={22} />
            </span>
          </article>

          <article className="approval-summary-card approval-summary-card--red">
            <div>
              <span>Access Denied</span>
              <strong>12</strong>
              <small>Blocked by access policy</small>
            </div>
            <span className="approval-summary-card__icon">
              <ApprovalIcon name="x" size={22} />
            </span>
          </article>

          <article className="approval-summary-card approval-summary-card--amber">
            <div>
              <span>Security Alerts</span>
              <strong>5</strong>
              <small>Events requiring attention</small>
            </div>
            <span className="approval-summary-card__icon">
              <ApprovalIcon name="shield-alert" size={22} />
            </span>
          </article>
        </section>

        {/* Main Card: Filters & Table */}
        <section className="approval-card" aria-label="Activity Table">
          <div className="approval-filters">
            <div
              className="approval-filter-grid"
              style={{
                gridTemplateColumns: 'minmax(0, 1.2fr) 9rem 9rem 9rem 9rem 6.5rem',
              }}
            >
              {/* Search */}
              <label className="approval-filter" htmlFor="activity-search">
                <ApprovalIcon name="search" size={17} />
                <input
                  id="activity-search"
                  type="search"
                  placeholder="Search employee or resource..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </label>

              {/* Event Type */}
              <label className="approval-filter" htmlFor="activity-event-type">
                <select
                  id="activity-event-type"
                  value={eventType}
                  onChange={(e) => {
                    setEventType(e.target.value)
                    setPage(1)
                  }}
                  aria-label="Filter by event type"
                >
                  <option value="all">Event Type</option>
                  {uniqueEventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ApprovalIcon name="chevron-down" size={16} />
              </label>

              {/* Employee */}
              <label className="approval-filter" htmlFor="activity-employee">
                <select
                  id="activity-employee"
                  value={employee}
                  onChange={(e) => {
                    setEmployee(e.target.value)
                    setPage(1)
                  }}
                  aria-label="Filter by employee"
                >
                  <option value="all">Employee</option>
                  {uniqueEmployees.map((emp) => (
                    <option key={emp} value={emp}>
                      {emp}
                    </option>
                  ))}
                </select>
                <ApprovalIcon name="chevron-down" size={16} />
              </label>

              {/* Resource */}
              <label className="approval-filter" htmlFor="activity-resource">
                <select
                  id="activity-resource"
                  value={resource}
                  onChange={(e) => {
                    setResource(e.target.value)
                    setPage(1)
                  }}
                  aria-label="Filter by resource"
                >
                  <option value="all">Resource</option>
                  {uniqueResources.map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>
                <ApprovalIcon name="chevron-down" size={16} />
              </label>

              {/* Date Range */}
              <label className="approval-filter" htmlFor="activity-date-range">
                <select
                  id="activity-date-range"
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value)
                    setPage(1)
                  }}
                  aria-label="Filter by date range"
                >
                  <option value="all">Date Range</option>
                  <option value="today">Today</option>
                  <option value="last-7-days">Last 7 days</option>
                  <option value="last-30-days">Last 30 days</option>
                </select>
                <ApprovalIcon name="chevron-down" size={16} />
              </label>

              {/* Clear Filters */}
              <button
                type="button"
                className="approval-history-clear-btn"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="approval-table-scroll" tabIndex={0} role="region" aria-label="Activity events table">
            <table className="approval-table">
              <caption className="sr-only">Team employee access events</caption>
              <thead>
                <tr>
                  <th scope="col" style={{ width: '15%' }}>Timestamp</th>
                  <th scope="col" style={{ width: '18%' }}>Employee</th>
                  <th scope="col" style={{ width: '22%' }}>Event</th>
                  <th scope="col" style={{ width: '21%' }}>Resource</th>
                  <th scope="col" style={{ width: '12%' }}>Status</th>
                  <th scope="col" style={{ width: '12%' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                      <p style={{ margin: 0, color: '#64748b' }}>No activity records match the selected filters.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedEvents.map((ev, index) => {
                    const initials =
                      ev.employeeName
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || '?'
                    const date = new Date(ev.timestamp)
                    return (
                      <tr key={ev.id}>
                        <td>
                          <time className="submitted-date" dateTime={ev.timestamp}>
                            <span>{dateFormatter.format(date)}</span>
                            <small>{timeFormatter.format(date)} UTC</small>
                          </time>
                        </td>
                        <td>
                          <div className="employee-cell">
                            <span className={`employee-avatar employee-avatar--${index % 4}`}>
                              {initials}
                            </span>
                            <strong>{ev.employeeName}</strong>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: '#1e293b' }}>{ev.event}</span>
                        </td>
                        <td>
                          <div className="resource-cell">
                            <strong>{ev.resourceName}</strong>
                            <small>{ev.resourceDescription}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`activity-status-badge ${getStatusClass(ev.status)}`}>
                            <span className="activity-status-badge__dot" />
                            {ev.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="details-link"
                            style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
                            onClick={() => setSelectedEvent(ev)}
                            aria-label={`View details for event ${ev.id}`}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="approval-pagination">
            <span>
              Showing {startRecord}–{endRecord} of {filteredEvents.length} events
            </span>

            <div className="approval-pagination__controls">
              <label>
                Rows per page
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                  aria-label="Rows per page"
                >
                  <option value={6}>6</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </label>

              <nav aria-label="Pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  aria-label="Previous page"
                >
                  <ApprovalIcon name="chevron-left" size={16} />
                </button>

                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-current={p === page ? 'page' : undefined}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}

                {totalPages > 3 && (
                  <>
                    <span style={{ padding: '0 0.35rem', color: '#94a3b8' }}>...</span>
                    <button
                      type="button"
                      aria-current={totalPages === page ? 'page' : undefined}
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  aria-label="Next page"
                >
                  <ApprovalIcon name="chevron-right" size={16} />
                </button>
              </nav>
            </div>
          </div>
        </section>

        {/* Security Alerts Bottom Banner matching reference */}
        <section className="activity-security-alert-card" aria-label="Security Alert">
          <div className="activity-security-alert-card__header">
            <span>Security Alerts</span>
            <span className="activity-security-alert-card__subtitle">• Recent event requiring attention</span>
          </div>

          <div className="activity-security-alert-card__content">
            <div className="activity-security-alert-card__left">
              <div className="activity-security-alert-card__icon">
                <ApprovalIcon name="shield-alert" size={20} />
              </div>
              <div className="activity-security-alert-card__text">
                <strong>Unusual login detected · Maya Chen · AWS Console</strong>
                <p>24 Oct 2026, 10:36 UTC · New device detected. Verify this activity with the employee.</p>
              </div>
            </div>

            <button
              type="button"
              className="activity-security-alert-card__btn"
              onClick={() => {
                const flagged = events.find((e) => e.status === 'Flagged')
                if (flagged) setSelectedEvent(flagged)
              }}
            >
              View Details
            </button>
          </div>
        </section>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="approval-modal-backdrop" role="dialog" aria-modal="true">
          <div className="approval-modal" style={{ maxWidth: '34rem' }}>
            <h3 className="approval-modal__title">Event Details — {selectedEvent.id}</h3>
            
            <div className="activity-modal-grid">
              <div className="activity-modal-item">
                <span>Employee</span>
                <strong>{selectedEvent.employeeName}</strong>
              </div>
              <div className="activity-modal-item">
                <span>Department</span>
                <strong>{selectedEvent.department}</strong>
              </div>
              <div className="activity-modal-item">
                <span>Resource</span>
                <strong>{selectedEvent.resourceName}</strong>
              </div>
              <div className="activity-modal-item">
                <span>Status</span>
                <span className={`activity-status-badge ${getStatusClass(selectedEvent.status)}`}>
                  <span className="activity-status-badge__dot" />
                  {selectedEvent.status}
                </span>
              </div>
              <div className="activity-modal-item">
                <span>Timestamp</span>
                <strong>
                  {dateFormatter.format(new Date(selectedEvent.timestamp))} {timeFormatter.format(new Date(selectedEvent.timestamp))} UTC
                </strong>
              </div>
              <div className="activity-modal-item">
                <span>IP Address</span>
                <strong>{selectedEvent.ipAddress ?? '192.168.1.100'}</strong>
              </div>
              <div className="activity-modal-item">
                <span>Device</span>
                <strong>{selectedEvent.deviceName ?? 'Corporate Managed Device'}</strong>
              </div>
              <div className="activity-modal-item">
                <span>Location</span>
                <strong>{selectedEvent.location ?? 'Office Network'}</strong>
              </div>
              <div className="activity-modal-item activity-modal-full">
                <span>Audit Description</span>
                <p>{selectedEvent.details}</p>
              </div>
              {selectedEvent.flagReason && (
                <div className="activity-modal-item activity-modal-full">
                  <span style={{ color: '#b54708', fontWeight: 600 }}>Security Note</span>
                  <p style={{ background: '#fffaeb', borderColor: '#fef08a', color: '#854d0e' }}>
                    {selectedEvent.flagReason}
                  </p>
                </div>
              )}
            </div>

            <div className="approval-modal__actions">
              <button
                type="button"
                className="approval-modal__btn-cancel"
                onClick={() => setSelectedEvent(null)}
              >
                Close
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

