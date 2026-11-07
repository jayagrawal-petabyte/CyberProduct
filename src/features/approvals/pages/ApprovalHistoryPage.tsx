import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApprovalIcon } from '../components/ApprovalIcon'
import { RequestStatusBadge } from '../components/RequestStatusBadge'
import { LeadBottomNav } from '../components/LeadBottomNav'
import { listApprovalRequests } from '../services/approvalRequestsApi'
import type { ApprovalRequest } from '../types/approvalRequest'
import '../styles/approvalInbox.css'
import '../styles/approvalHistory.css'

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

export default function ApprovalHistoryPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters state
  const [search, setSearch] = useState('')
  const [decision, setDecision] = useState<'all' | 'approved' | 'rejected'>('all')
  const [resource, setResource] = useState('all')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'last-7-days' | 'last-30-days'>('all')

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listApprovalRequests()
      setRequests(data)
    } catch {
      setError('Failed to load approval history records.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRequests()
  }, [fetchRequests])

  // Metric counts
  const counts = useMemo(() => {
    const approved = requests.filter((r) => r.status.toLowerCase() === 'approved').length
    const rejected = requests.filter((r) => r.status.toLowerCase() === 'rejected').length
    const pending = requests.filter((r) => r.status.toLowerCase() === 'pending').length
    return {
      totalReviewed: approved + rejected,
      approved,
      rejected,
      pending,
    }
  }, [requests])

  // Unique resources for dropdown
  const uniqueResources = useMemo(() => {
    const set = new Set<string>()
    for (const r of requests) {
      if (r.resourceName) set.add(r.resourceName)
    }
    return Array.from(set).sort()
  }, [requests])

  // Filtered requests (Default shows reviewed requests unless specifically filtered)
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const isReviewed = req.status.toLowerCase() === 'approved' || req.status.toLowerCase() === 'rejected'
      
      // If decision is 'all', show all reviewed records
      if (decision === 'all' && !isReviewed) return false
      if (decision === 'approved' && req.status.toLowerCase() !== 'approved') return false
      if (decision === 'rejected' && req.status.toLowerCase() !== 'rejected') return false

      if (resource !== 'all' && req.resourceName !== resource) return false

      if (search.trim()) {
        const query = search.toLowerCase()
        const matchesName = req.employeeName.toLowerCase().includes(query)
        const matchesResource = req.resourceName.toLowerCase().includes(query)
        const matchesId = req.id.toLowerCase().includes(query)
        if (!matchesName && !matchesResource && !matchesId) return false
      }

      if (dateRange !== 'all') {
        const reqDate = new Date(req.requestedAt).getTime()
        const now = Date.now()
        const dayMs = 24 * 60 * 60 * 1000
        if (dateRange === 'today' && now - reqDate > dayMs) return false
        if (dateRange === 'last-7-days' && now - reqDate > 7 * dayMs) return false
        if (dateRange === 'last-30-days' && now - reqDate > 30 * dayMs) return false
      }

      return true
    })
  }, [requests, search, decision, resource, dateRange])

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredRequests.slice(start, start + pageSize)
  }, [filteredRequests, page, pageSize])

  const hasActiveFilters = search !== '' || decision !== 'all' || resource !== 'all' || dateRange !== 'all'

  const clearFilters = () => {
    setSearch('')
    setDecision('all')
    setResource('all')
    setDateRange('all')
    setPage(1)
  }

  const startRecord = filteredRequests.length === 0 ? 0 : (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, filteredRequests.length)

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
            <h1>Approval History</h1>
            <p>Review past access decisions made for your team.</p>
          </div>
          <div className="approval-page-actions">
            <button
              type="button"
              className="approval-refresh"
              onClick={() => void fetchRequests()}
              disabled={loading}
              aria-label="Refresh approval history"
            >
              <ApprovalIcon name="refresh" size={18} />
            </button>
          </div>
        </header>

        {/* 4 Summary Metric Cards */}
        <section className="approval-summary" aria-label="Approval history metrics">
          <article className="approval-summary-card approval-summary-card--purple">
            <div>
              <span>Total Reviewed</span>
              <strong>{loading ? '—' : counts.totalReviewed}</strong>
              <small>Approved and rejected decisions</small>
            </div>
            <span className="approval-summary-card__icon">
              <ApprovalIcon name="clipboard" size={21} />
            </span>
          </article>

          <article className="approval-summary-card approval-summary-card--green">
            <div>
              <span>Approved</span>
              <strong>{loading ? '—' : counts.approved}</strong>
              <small>Access requests approved</small>
            </div>
            <span className="approval-summary-card__icon">
              <ApprovalIcon name="check" size={21} />
            </span>
          </article>

          <article className="approval-summary-card approval-summary-card--red">
            <div>
              <span>Rejected</span>
              <strong>{loading ? '—' : counts.rejected}</strong>
              <small>Access requests rejected</small>
            </div>
            <span className="approval-summary-card__icon">
              <ApprovalIcon name="x" size={21} />
            </span>
          </article>

          <article className="approval-summary-card approval-summary-card--amber">
            <div>
              <span>Pending Review</span>
              <strong>{loading ? '—' : counts.pending}</strong>
              <small>Separate queue · not in reviewed total</small>
            </div>
            <span className="approval-summary-card__icon">
              <ApprovalIcon name="clock" size={21} />
            </span>
          </article>
        </section>

        {/* Main Card: Filters & Table */}
        <section className="approval-card" aria-label="Approval history table" aria-busy={loading}>
          <div className="approval-filters">
            <div className="approval-filter-grid">
              {/* Search */}
              <label className="approval-filter" htmlFor="history-search">
                <ApprovalIcon name="search" size={17} />
                <input
                  id="history-search"
                  type="search"
                  placeholder="Search employee or resource..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </label>

              {/* Decision Filter */}
              <label className="approval-filter" htmlFor="history-decision">
                <select
                  id="history-decision"
                  value={decision}
                  onChange={(e) => {
                    setDecision(e.target.value as 'all' | 'approved' | 'rejected')
                    setPage(1)
                  }}
                  aria-label="Filter by decision"
                >
                  <option value="all">Decision</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ApprovalIcon name="chevron-down" size={16} />
              </label>

              {/* Resource Filter */}
              <label className="approval-filter" htmlFor="history-resource">
                <select
                  id="history-resource"
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

              {/* Date Range Filter */}
              <label className="approval-filter" htmlFor="history-date-range">
                <select
                  id="history-date-range"
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value as 'all' | 'today' | 'last-7-days' | 'last-30-days')
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

          {error && (
            <div className="approval-feedback" role="alert">
              <strong>Error loading history</strong>
              <span>{error}</span>
              <button type="button" onClick={() => void fetchRequests()}>
                Try again
              </button>
            </div>
          )}

          {/* Table */}
          <div className="approval-table-scroll" tabIndex={0} role="region" aria-label="Approval history">
            <table className="approval-table approval-history-table">
              <caption className="sr-only">Past access decisions</caption>
              <thead>
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col">Resource</th>
                  <th scope="col">Access Level</th>
                  <th scope="col">Decision</th>
                  <th scope="col">Reviewed By</th>
                  <th scope="col">Review Date</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                      <p style={{ margin: 0, color: '#64748b' }}>No reviewed requests match the selected filters.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req, index) => {
                    const initials =
                      req.employeeName
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || '?'
                    const date = new Date(req.requestedAt)
                    return (
                      <tr key={req.id}>
                        <td>
                          <div className="employee-cell">
                            <span className={`employee-avatar employee-avatar--${index % 4}`}>
                              {initials}
                            </span>
                            <strong>{req.employeeName}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="resource-cell">
                            <strong>{req.resourceName}</strong>
                            <small>{req.resourceDescription || 'Engineering organization'}</small>
                          </div>
                        </td>
                        <td>{req.accessLevel || 'Read-only'}</td>
                        <td>
                          <RequestStatusBadge status={req.status} />
                        </td>
                        <td>
                          <span className="reviewer-name">{req.reviewedBy || 'Alex Morgan'}</span>
                        </td>
                        <td>
                          <time className="submitted-date" dateTime={req.requestedAt}>
                            <span>{dateFormatter.format(date)}</span>
                            <small>{timeFormatter.format(date)} UTC</small>
                          </time>
                        </td>
                        <td>
                          <Link
                            className="details-link"
                            to={`/lead/approvals/${encodeURIComponent(req.id)}`}
                            aria-label={`View details for request ${req.id}`}
                          >
                            View Details
                          </Link>
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
              Showing {startRecord}–{endRecord} of {filteredRequests.length} reviewed records
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-current={p === page ? 'page' : undefined}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
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

        {/* Bottom Card: Decision Details */}
        <section className="approval-history-details-card" aria-label="Decision details">
          <div className="approval-history-details-card__header">
            <h3 className="approval-history-details-card__title">Decision Details</h3>
            <span className="approval-history-details-card__subtitle">Example decision notes</span>
          </div>
          <div className="approval-history-notes-list">
            <div className="approval-history-note-item approval-history-note-item--approved">
              <strong>Approved:</strong> Access required for the assigned project.
            </div>
            <div className="approval-history-note-item approval-history-note-item--rejected">
              <strong>Rejected:</strong> Requested permissions exceeded the stated business need.
            </div>
          </div>
        </section>
      </div>

      {/* Floating Bottom Nav */}
      <LeadBottomNav />
    </main>
  )
}

