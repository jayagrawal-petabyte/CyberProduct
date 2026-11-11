import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ApprovalIcon } from '../components/ApprovalIcon'
import { LeadBottomNav } from '../components/LeadBottomNav'
import { listApprovalRequests } from '../services/approvalRequestsApi'
import type { ApprovalRequest } from '../types/approvalRequest'
import '../styles/approvalInbox.css'

export default function ApprovalInboxPage() {
  const location = useLocation()
  const basePath = location.pathname.startsWith('/lead/') ? '/lead/approvals' : '/approvals'

  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'attention'>('pending')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await listApprovalRequests()
      setRequests(data)
    } catch {
      setError('We could not load access requests. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRequests()
  }, [fetchRequests])

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (activeTab === 'attention' && req.compliance !== 'At risk') return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchesName = req.employeeName.toLowerCase().includes(q)
        const matchesId = req.id.toLowerCase().includes(q)
        const matchesRes = req.resourceName.toLowerCase().includes(q)
        if (!matchesName && !matchesId && !matchesRes) return false
      }
      return true
    })
  }, [requests, activeTab, search])

  return (
    <main className="approval-page">
      <a className="sr-only" href="#approval-content">
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

      <div className="approval-content" id="approval-content">
        {/* Page Header */}
        <header className="approval-page-header">
          <div>
            <h1>Access Requests</h1>
            <p>
              Review access requests from your Data &amp; Insights team. Only your assigned team is visible.
            </p>
          </div>
          <button
            type="button"
            className="approval-export-btn"
            onClick={() => alert('Exporting access requests queue...')}
          >
            <ApprovalIcon name="save" size={16} />
            <span>Export queue</span>
          </button>
        </header>

        {error && (
          <div className="approval-card" style={{ marginBottom: '1.25rem', color: '#b91c1c' }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <section className="approval-summary" aria-label="Request summary">
          <article className="approval-summary-card">
            <span>Pending requests</span>
            <strong>05</strong>
            <small>Requires your decision</small>
          </article>

          <article className="approval-summary-card">
            <span>Approaching SLA</span>
            <strong>02</strong>
            <small className="highlight-amber">Review within the next hour</small>
          </article>

          <article className="approval-summary-card">
            <span>Policy checks passed</span>
            <strong>04</strong>
            <small>1 device needs remediation</small>
          </article>

          <article className="approval-summary-card">
            <span>Reviewed today</span>
            <strong>03</strong>
            <small>2 approved · 1 rejected</small>
          </article>
        </section>

        {/* Category Tabs */}
        <div className="approval-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pending'}
            className={`approval-tab ${activeTab === 'pending' ? 'approval-tab--active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending (5)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`approval-tab ${activeTab === 'all' ? 'approval-tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All requests (42)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'attention'}
            className={`approval-tab ${activeTab === 'attention' ? 'approval-tab--active' : ''}`}
            onClick={() => setActiveTab('attention')}
          >
            Needs attention (2)
          </button>
        </div>

        {/* Main Card: Pending review table */}
        <section className="approval-card" aria-label="Pending review table">
          <div className="approval-card-title-group">
            <h2 className="approval-card-title">Pending review</h2>
            <p className="approval-card-subtitle">
              {filteredRequests.length} requests · Sorted by submitted time
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
                  placeholder="Search employee, resource, or ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search employee, resource, or ID"
                />
              </div>

              <button type="button" className="approval-dropdown-btn">
                <ApprovalIcon name="sliders" size={15} />
                <span>All resources</span>
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
                <th scope="col">EMPLOYEE / ID</th>
                <th scope="col">RESOURCE</th>
                <th scope="col">ACCESS / DURATION</th>
                <th scope="col">COMPLIANCE</th>
                <th scope="col">SUBMITTED</th>
                <th scope="col">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && requests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No access requests match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="approval-emp-cell">
                        <span className="approval-emp-name">{req.employeeName}</span>
                        <span className="approval-emp-id">{req.id}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>{req.resourceName}</span>
                    </td>
                    <td>
                      <span style={{ color: '#334155' }}>
                        {req.accessLevel} · {req.duration}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`approval-compliance-badge ${
                          req.compliance === 'At risk'
                            ? 'approval-compliance-badge--at-risk'
                            : 'approval-compliance-badge--compliant'
                        }`}
                      >
                        <span className="approval-compliance-badge__dot" />
                        {req.compliance || 'Compliant'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#64748b' }}>
                        {req.submittedTimeText || 'Today, 09:18'}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`${basePath}/${req.id}`}
                        className="approval-action-link"
                        aria-label={`Review request ${req.id} for ${req.employeeName}`}
                      >
                        Review request →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Table Footer */}
          <div className="approval-table-footer">
            <span>Showing {filteredRequests.length} of {requests.length} records</span>
            <div className="approval-pagination-nav">
              <span>← Previous</span>
              <span className="approval-pagination-nav__active">1</span>
              <span>Next →</span>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Bottom Nav */}
      <LeadBottomNav activeId="approvals" />
    </main>
  )
}
export { ApprovalInboxPage }
