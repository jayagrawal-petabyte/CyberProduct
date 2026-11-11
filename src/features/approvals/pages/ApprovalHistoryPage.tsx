import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApprovalIcon } from '../components/ApprovalIcon'
import { LeadBottomNav } from '../components/LeadBottomNav'
import { listApprovalHistory } from '../services/approvalRequestsApi'
import type { ApprovalRequest } from '../types/approvalRequest'
import '../styles/approvalInbox.css'
import '../styles/approvalHistory.css'

export default function ApprovalHistoryPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters state
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'rejected'>('all')

  // Pagination state - 7 items per page as shown in Figma
  const [page, setPage] = useState(1)
  const pageSize = 7

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listApprovalHistory()
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
    return {
      total: requests.length || 37,
      approved: approved || 32,
      rejected: rejected || 5,
    }
  }, [requests])

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const statusLower = req.status.toLowerCase()
      if (activeTab === 'approved' && statusLower !== 'approved') return false
      if (activeTab === 'rejected' && statusLower !== 'rejected') return false

      if (search.trim()) {
        const query = search.toLowerCase()
        const matchesName = req.employeeName.toLowerCase().includes(query)
        const matchesResource = req.resourceName.toLowerCase().includes(query)
        const matchesId = req.id.toLowerCase().includes(query)
        const matchesReason = req.decisionReason?.toLowerCase().includes(query) ?? false
        if (!matchesName && !matchesResource && !matchesId && !matchesReason) return false
      }

      return true
    })
  }, [requests, activeTab, search])

  // Paginated requests
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredRequests.slice(start, start + pageSize)
  }, [filteredRequests, page, pageSize])

  const startRecord = filteredRequests.length === 0 ? 0 : (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, filteredRequests.length)

  return (
    <main className="approval-page">
      <a className="sr-only" href="#history-content">
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

      <div className="approval-content" id="history-content">
        {/* Page Header */}
        <header className="approval-page-header">
          <div>
            <h1>Approval History</h1>
            <p>
              A complete record of your team&apos;s access decisions and the reasons behind them.
            </p>
          </div>
          <button
            type="button"
            className="approval-export-btn"
            onClick={() => alert('Exporting approval history records...')}
          >
            <ApprovalIcon name="save" size={16} />
            <span>Export history</span>
          </button>
        </header>

        {error && (
          <div className="approval-card" style={{ marginBottom: '1.25rem', color: '#b91c1c' }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <section className="approval-summary" aria-label="Approval History summary">
          <article className="approval-summary-card">
            <span>Decisions this month</span>
            <strong>37</strong>
            <small>Data &amp; Insights team</small>
          </article>

          <article className="approval-summary-card">
            <span>Approved</span>
            <strong>32</strong>
            <small>86% approval rate</small>
          </article>

          <article className="approval-summary-card">
            <span>Rejected</span>
            <strong>05</strong>
            <small>14% rejection rate</small>
          </article>

          <article className="approval-summary-card">
            <span>Average review time</span>
            <strong>2.4h</strong>
            <small>SLA target &lt; 4h</small>
          </article>
        </section>

        {/* Category Tabs */}
        <div className="approval-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`approval-tab ${activeTab === 'all' ? 'approval-tab--active' : ''}`}
            onClick={() => {
              setActiveTab('all')
              setPage(1)
            }}
          >
            All decisions ({counts.total})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'approved'}
            className={`approval-tab ${activeTab === 'approved' ? 'approval-tab--active' : ''}`}
            onClick={() => {
              setActiveTab('approved')
              setPage(1)
            }}
          >
            Approved ({counts.approved})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'rejected'}
            className={`approval-tab ${activeTab === 'rejected' ? 'approval-tab--active' : ''}`}
            onClick={() => {
              setActiveTab('rejected')
              setPage(1)
            }}
          >
            Rejected ({counts.rejected})
          </button>
        </div>

        {/* Main Card: Decision log */}
        <section className="approval-card" aria-label="Decision log table">
          <div className="approval-card-title-group">
            <h2 className="approval-card-title">Decision log</h2>
            <p className="approval-card-subtitle">
              Data &amp; Insights · Decisions by Daniel Brooks
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
                  placeholder="Search by employee, resource, or request ID..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  aria-label="Search by employee, resource, or request ID"
                />
              </div>

              <button type="button" className="approval-dropdown-btn">
                <ApprovalIcon name="sliders" size={15} />
                <span>This month</span>
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
                <th scope="col">EMPLOYEE / REQUEST</th>
                <th scope="col">RESOURCE</th>
                <th scope="col">DECISION</th>
                <th scope="col">DECISION REASON</th>
                <th scope="col">DECIDED AT</th>
              </tr>
            </thead>
            <tbody>
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading decisions history...
                  </td>
                </tr>
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No decisions found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req) => {
                  const initials = req.employeeName
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                  const isApproved = req.status.toLowerCase() === 'approved'

                  return (
                    <tr key={req.id}>
                      <td>
                        <div className="approval-table-user">
                          <div className="approval-table-avatar">{initials}</div>
                          <div className="approval-table-user-info">
                            <span className="approval-table-user-name">{req.employeeName}</span>
                            <span className="approval-table-user-sub">
                              {req.employeeId || 'EMP-1042'} · {req.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="approval-table-user-info">
                          <span className="approval-table-user-name">{req.resourceName}</span>
                          <span className="approval-table-user-sub">
                            {req.resourceDescription || `${req.accessLevel || 'Read-only'} access`}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`history-badge ${
                            isApproved ? 'history-badge--approved' : 'history-badge--rejected'
                          }`}
                        >
                          <span className="history-badge__dot" />
                          {isApproved ? 'Approved' : 'Rejected'}
                        </span>
                      </td>
                      <td>
                        <span className="history-table-reason">
                          {req.decisionReason || (isApproved ? 'Standard team project access' : 'Privilege policy check')}
                        </span>
                      </td>
                      <td>
                        <span className="history-table-time">
                          {req.submittedTimeText || '24 Oct, 10:12'}
                        </span>
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
              Showing {startRecord} to {endRecord} of {filteredRequests.length} decisions
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
      <LeadBottomNav activeId="history" />
    </main>
  )
}
