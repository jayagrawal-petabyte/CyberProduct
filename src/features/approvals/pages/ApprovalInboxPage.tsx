import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ApprovalFilters } from '../components/ApprovalFilters'
import { ApprovalIcon } from '../components/ApprovalIcon'
import { ApprovalPagination } from '../components/ApprovalPagination'
import { ApprovalRequestsTable } from '../components/ApprovalRequestsTable'
import { approvalRequestsDataSource, listApprovalRequests } from '../services/approvalRequestsApi'
import type { ApprovalFilters as ApprovalFiltersState, ApprovalRequest } from '../types/approvalRequest'
import { filterApprovalRequests, getStatusCounts } from '../utils/approvalRequestFilters'
import '../styles/approvalInbox.css'

const initialFilters: ApprovalFiltersState = { search: '', status: 'all', resource: '', dateRange: 'all' }

export default function ApprovalInboxPage() {
  const location = useLocation()
  const basePath = location.pathname.startsWith('/lead/') ? '/lead/approvals' : '/approvals'
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [filters, setFilters] = useState<ApprovalFiltersState>(initialFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sequence = useRef(0)

  const fetchRequests = useCallback(async () => {
    const currentSequence = ++sequence.current
    setIsLoading(true)
    setError(null)
    try {
      const loadedRequests = await listApprovalRequests()
      if (currentSequence !== sequence.current) return
      setRequests(loadedRequests)
      setHasLoaded(true)
    } catch {
      if (currentSequence === sequence.current) setError('We could not load the access requests. Try again.')
    } finally {
      if (currentSequence === sequence.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRequests()
    return () => { sequence.current += 1 }
  }, [fetchRequests])

  const counts = useMemo(() => getStatusCounts(requests), [requests])
  const filteredRequests = useMemo(() => filterApprovalRequests(requests, filters), [filters, requests])
  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageRequests = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const hasActiveFilters = Boolean(filters.search || filters.resource || filters.status !== 'all' || filters.dateRange !== 'all')

  const updateFilters = (updates: Partial<ApprovalFiltersState>) => {
    setFilters((current) => ({ ...current, ...updates }))
    setPage(1)
  }
  const clearFilters = () => {
    setFilters(initialFilters)
    setPage(1)
  }

  return <main className="approval-page">
    <a className="approval-skip-link" href="#approval-content">Skip to main content</a>
    <header className="approval-brand-header">
      <img src="/assets/brainmint-logo.png" alt="BrainMint" />
      <button className="approval-profile-button" type="button" aria-label="Profile (not available yet)"><ApprovalIcon name="user" size={21} /></button>
    </header>

    <div className="approval-content" id="approval-content">
      <header className="approval-page-header">
        <div><h1>Access Requests</h1><p>Review and manage access requests submitted by your team.</p></div>
        <div className="approval-page-actions">
          <span title={approvalRequestsDataSource}>Development mock data</span>
          <button type="button" className="approval-refresh" onClick={() => void fetchRequests()} disabled={isLoading} aria-label={isLoading ? 'Refreshing requests' : 'Refresh requests'}><ApprovalIcon name="refresh" size={18} /></button>
        </div>
      </header>

      <section className="approval-summary" aria-label="Request summary">
        <SummaryCard label="Pending Review" value={hasLoaded ? counts.pending : '—'} detail="Awaiting your review" icon="clock" tone="amber" />
        <SummaryCard label="Approved" value={hasLoaded ? counts.approved : '—'} detail="Approved in this inbox" icon="check" tone="green" />
        <SummaryCard label="Rejected" value={hasLoaded ? counts.rejected : '—'} detail="Rejected in this inbox" icon="x" tone="red" />
        <SummaryCard label="Total Requests" value={hasLoaded ? requests.length : '—'} detail="Submitted to your team" icon="clipboard" tone="purple" />
      </section>

      <section className="approval-card" aria-label="Access requests" aria-busy={isLoading}>
        <ApprovalFilters filters={filters} requests={requests} hasActiveFilters={hasActiveFilters} onChange={updateFilters} onClear={clearFilters} />
        {error ? <div className="approval-feedback" role="alert"><strong>Requests unavailable</strong><span>{error}</span><button type="button" onClick={() => void fetchRequests()}>Try again</button></div> : null}
        {isLoading && !hasLoaded ? <LoadingState /> : null}
        {!isLoading && !error && hasLoaded && requests.length === 0 ? <EmptyState onRefresh={() => void fetchRequests()} /> : null}
        {!isLoading && !error && requests.length > 0 && pageRequests.length === 0 ? <NoResultsState onClear={clearFilters} /> : null}
        {requests.length > 0 && pageRequests.length > 0 ? <>
          <ApprovalRequestsTable requests={pageRequests} basePath={basePath} />
          <ApprovalPagination total={filteredRequests.length} page={currentPage} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1) }} />
        </> : null}
      </section>
    </div>

    <nav className="approval-bottom-nav" aria-label="Primary navigation">
      <button type="button" disabled aria-label="Dashboard (not available yet)"><ApprovalIcon name="grid" size={23} /></button>
      <button type="button" disabled aria-label="Devices (not available yet)"><ApprovalIcon name="monitor" size={23} /></button>
      <button type="button" disabled aria-label="Request access (not available yet)"><ApprovalIcon name="plus" size={23} /></button>
      <Link className="approval-bottom-nav__active" to={basePath} aria-current="page" aria-label="Access requests"><ApprovalIcon name="clipboard" size={23} /></Link>
      <button type="button" disabled aria-label="Notifications (not available yet)"><ApprovalIcon name="bell" size={23} /></button>
      <button type="button" disabled aria-label="Profile (not available yet)"><ApprovalIcon name="user" size={23} /></button>
    </nav>
  </main>
}

function SummaryCard({ label, value, detail, icon, tone }: { label: string; value: number | string; detail: string; icon: 'clock' | 'check' | 'x' | 'clipboard'; tone: string }) {
  return <article className={`approval-summary-card approval-summary-card--${tone}`}>
    <div><span>{label}</span><strong aria-label={`${label}: ${value}`}>{value}</strong><small>{detail}</small></div>
    <span className="approval-summary-card__icon"><ApprovalIcon name={icon} size={21} /></span>
  </article>
}

function LoadingState() {
  return <div className="approval-loading" role="status"><span className="sr-only">Loading access requests</span>{Array.from({ length: 6 }, (_, row) => <div key={row}>{Array.from({ length: 6 }, (_, cell) => <i key={cell} />)}</div>)}</div>
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return <div className="approval-state" role="status"><ApprovalIcon name="clipboard" size={34} /><h2>No access requests yet</h2><p>There are no requests to review right now.</p><button type="button" onClick={onRefresh}>Refresh inbox</button></div>
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return <div className="approval-state" role="status"><ApprovalIcon name="search" size={34} /><h2>No requests match these filters</h2><p>Try a different search or filter.</p><button type="button" onClick={onClear}>Clear filters</button></div>
}
