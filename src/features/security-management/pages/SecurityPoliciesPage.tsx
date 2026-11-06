/**
 * BrainMint — Security Policies Page
 * Scope: src/features/security-management/pages/SecurityPoliciesPage.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Implements the approved "Security Policies" screen:
 * - Page heading, subtitle and "+ Create policy" primary action
 * - Four summary metric cards (derived from the dataset, never hardcoded)
 * - Policy library card: search, state/category filters, snapshot date chip
 * - Policy table with Manage / Edit draft actions and pagination (6 per page)
 * - Rollout reminder banner with a local-prototype "Send reminder" action
 * - Policy details + Create/Edit modals with required-field validation
 * - BrainMint pastel pink/plum background, concentric rings, FloatingDock
 *
 * ⚠️ LOCAL DEVELOPMENT PROTOTYPE — all data is mock and all create/edit
 * operations are in-memory only. This screen does NOT enforce any policy:
 * no website/application blocking, acknowledgment dispatching, or access
 * decisions are performed here (those belong to the backend/security engine).
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../../components/ui'
import PoliciesTable from '../components/PoliciesTable'
import PolicyFilters from '../components/PolicyFilters'
import PolicyDetailsModal from '../components/PolicyDetailsModal'
import PolicyFormModal from '../components/PolicyFormModal'
import {
  useSecurityPolicies,
  filterPolicies,
  type UseSecurityPoliciesResult,
} from '../hooks/useSecurityPolicies'
import {
  SNAPSHOT_DATE,
  SNAPSHOT_NEXT_REMINDER,
  POLICY_CATEGORY_OPTIONS,
} from '../data/mockSecurityPolicies'
import {
  SecurityPolicyRecord,
  PolicyFiltersState,
  PolicyFormValues,
  DEFAULT_POLICY_FILTERS,
} from '../types/policy.types'
import './SecurityPoliciesPage.css'

const PAGE_SIZE = 6

/** Author display name for locally created draft policies. */
const LOCAL_AUTHOR_NAME = 'Priya Shah'

/** Windowed page list with ellipsis handling (shared page pattern). */
function pageList(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set<number>([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: Array<number | 'gap'> = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('gap')
    out.push(p)
    prev = p
  }
  return out
}

/** Zero-pads small counts for the "Draft policies" card ("02"), per design. */
function formatDraftCount(value: number): string {
  return String(value).padStart(2, '0')
}

export const SecurityPoliciesPage: React.FC = () => {
  const {
    policies,
    summary,
    isLoading,
    lastUpdated,
    createLocalPolicy,
    updateLocalPolicy,
  } = useSecurityPolicies() as UseSecurityPoliciesResult

  const [filters, setFilters] = useState<PolicyFiltersState>(DEFAULT_POLICY_FILTERS)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SecurityPolicyRecord | null>(null)
  const [editor, setEditor] = useState<
    { mode: 'create' } | { mode: 'edit'; policy: SecurityPolicyRecord } | null
  >(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Apply all filters together, memoized.
  const filtered = useMemo(() => filterPolicies(policies, filters), [policies, filters])

  // Reset pagination when filters or dataset change.
  useEffect(() => {
    setPage(1)
  }, [filters, policies])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRecords = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.state !== 'all' ||
    filters.category !== 'all'

  const rollout = summary.rollout

  /**
   * LOCAL DEVELOPMENT PROTOTYPE — append/patch in-memory mock records only.
   * Nothing is persisted or enforced.
   */
  const handleCreate = (values: PolicyFormValues) => {
    const created = createLocalPolicy(
      { ...values, effectiveFrom: SNAPSHOT_DATE, ackCurrent: 0, ackTarget: 0 },
      LOCAL_AUTHOR_NAME,
    )
    setEditor(null)
    if (created) {
      setFeedback(
        `"${created.name}" (${created.policyId}) added as a local draft — in-memory only, nothing enforced.`,
      )
    }
  }

  const handleUpdate = (values: PolicyFormValues) => {
    if (!editor || editor.mode !== 'edit') return
    const updated = updateLocalPolicy(editor.policy, values)
    setEditor(null)
    if (updated) {
      setFeedback(
        `"${updated.name}" (${updated.policyId}) updated locally — changes are in-memory only.`,
      )
    }
  }

  const handleSendReminder = () => {
    setFeedback(
      'Local prototype only: reminder not dispatched — policy acknowledgment runs on the backend.',
    )
  }

  return (
    <main className="secpol-page">
      <a className="secpol-skip-link" href="#secpol-content">Skip to main content</a>
      <span className="secpol-accent-dot" aria-hidden="true" />

      {/* ── Brand header (same as Admin Dashboard) ── */}
      <header className="secpol-brand-header">
        <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        <button className="secpol-profile-button" type="button" aria-label="Profile">
          <Icon name="user" size={21} />
        </button>
      </header>

      <div className="secpol-content" id="secpol-content">

        {/* ── Page header (same typography as Admin Dashboard) ── */}
        <header className="secpol-page-header">
          <div>
            <h1>Security Policies</h1>
            <p>Manage policy enforcement, published versions, and workforce acknowledgment.</p>
          </div>
          <div className="secpol-page-actions">
            <span title="All data on this screen is development mock data">Development mock data</span>
            <button
              type="button"
              className="secpol-btn-primary"
              onClick={() => setEditor({ mode: 'create' })}
            >
              <Icon name="plus" size={14} />
              Create policy
            </button>
          </div>
        </header>

        {/* ── Feedback toast (local prototype confirmations) ── */}
        {feedback && (
          <div className="secpol-feedback" role="status">
            <Icon name="check-circle" size={15} />
            <span>{feedback}</span>
          </div>
        )}

        {/* ── Summary metric cards ── */}
        <section className="secpol-summary" aria-label="Policy overview">
          <article className="secpol-metric">
            <span className="secpol-metric-label">Active policies</span>
            <strong className="secpol-metric-value" aria-label={`Active policies: ${summary.published}`}>
              {summary.published}
            </strong>
            <small className="secpol-metric-sub">Enforced across all workspaces</small>
          </article>

          <article className="secpol-metric">
            <span className="secpol-metric-label">Acknowledgment rate</span>
            <strong className="secpol-metric-value" aria-label={`Acknowledgment rate: ${summary.ackRatePct} percent`}>
              {summary.ackRatePct}%
            </strong>
            <small className="secpol-metric-sub secpol-metric-sub--success">
              {summary.ackCurrent} of {summary.ackTarget} users up to date
            </small>
          </article>

          <article className="secpol-metric">
            <span className="secpol-metric-label">Pending acknowledgments</span>
            <strong className="secpol-metric-value" aria-label={`Pending acknowledgments: ${summary.pendingUsers}`}>
              {summary.pendingUsers}
            </strong>
            <small className="secpol-metric-sub secpol-metric-sub--warning">
              {rollout
                ? `${rollout.name} ${rollout.version} · Due ${rollout.ackDue}`
                : 'No acknowledgments pending'}
            </small>
          </article>

          <article className="secpol-metric">
            <span className="secpol-metric-label">Draft policies</span>
            <strong className="secpol-metric-value" aria-label={`Draft policies: ${summary.drafts}`}>
              {formatDraftCount(summary.drafts)}
            </strong>
            <small className="secpol-metric-sub">Not yet published</small>
          </article>
        </section>

        {/* ── Policy library card ── */}
        <section className="secpol-library" aria-label="Policy library">
          <div className="secpol-library-head">
            <h2 className="secpol-library-title">Policy library</h2>
            <p className="secpol-library-sub">
              Published policies are versioned and audit-tracked
              {' · '}Mock refreshed {lastUpdated}
            </p>
          </div>

          <div className="secpol-toolbar">
            <PolicyFilters
              filters={filters}
              onChange={setFilters}
              categories={POLICY_CATEGORY_OPTIONS}
              resultCount={filtered.length}
              totalCount={policies.length}
              snapshotDate={SNAPSHOT_DATE}
            />
          </div>

          <PoliciesTable
            policies={pageRecords}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onViewDetails={setSelected}
            onEditPolicy={(policy) => setEditor({ mode: 'edit', policy })}
          />

          {/* ── Pagination ── */}
          <nav className="secpol-pagination" aria-label="Policy library pagination">
            <span className="secpol-pagination__meta">
              Showing {pageRecords.length} of {filtered.length} policies
              {hasActiveFilters ? ` (filtered from ${policies.length})` : ''}
            </span>
            <div className="secpol-pagination__controls">
              <button
                type="button"
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                <Icon name="chevron-left" size={13} />
                Previous
              </button>
              <ol className="secpol-pagination__pages">
                {pageList(safePage, totalPages).map((item, i) =>
                  item === 'gap' ? (
                    <li key={`gap-${i}`} className="secpol-pagination__gap" aria-hidden="true">…</li>
                  ) : (
                    <li key={item}>
                      <button
                        type="button"
                        className={item === safePage ? 'secpol-pagination__page--current' : ''}
                        onClick={() => setPage(item)}
                        aria-label={`Page ${item}`}
                        aria-current={item === safePage ? 'page' : undefined}
                      >
                        {item}
                      </button>
                    </li>
                  ),
                )}
              </ol>
              <button
                type="button"
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages}
                aria-label="Next page"
              >
                Next
                <Icon name="arrow-right" size={13} />
              </button>
            </div>
          </nav>
        </section>

        {/* ── Rollout reminder banner (derived from mock data) ── */}
        {rollout && !isLoading && (
          <section className="secpol-banner" aria-label="Acknowledgment rollout reminder">
            <div>
              <p className="secpol-banner__title">
                {rollout.name} {rollout.version} · Rollout in progress
              </p>
              <p className="secpol-banner__sub">
                {summary.pendingUsers} employees still need to acknowledge. Next
                reminder: <strong>{SNAPSHOT_NEXT_REMINDER}</strong>.
              </p>
            </div>
            <button
              type="button"
              className="secpol-btn-ghost secpol-btn-ghost--small"
              onClick={handleSendReminder}
            >
              <Icon name="bell" size={13} />
              Send reminder
            </button>
          </section>
        )}

      </div>

      {/* ── Details modal ── */}
      <PolicyDetailsModal
        policy={selected}
        onClose={() => setSelected(null)}
        onEdit={(policy) => {
          setSelected(null)
          setEditor({ mode: 'edit', policy })
        }}
      />

      {/* ── Create / Edit modal (local development prototype) ── */}
      <PolicyFormModal
        isOpen={editor !== null}
        onClose={() => setEditor(null)}
        onSubmit={editor?.mode === 'edit' ? handleUpdate : handleCreate}
        mode={editor?.mode === 'edit' ? 'edit' : 'create'}
        initial={editor?.mode === 'edit' ? editor.policy : null}
        categories={POLICY_CATEGORY_OPTIONS}
      />
    </main>
  )
}

export default SecurityPoliciesPage
