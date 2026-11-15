/**
 * BrainMint — Restricted Resources Page
 * Scope: src/features/security-management/pages/RestrictedResourcesPage.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Implements the approved "Restricted Resources" screen, visually consistent
 * with the Security Policies screen (shared .secpol-* page chassis:
 * pastel pink/plum background, brand header, summary cards, toolbar,
 * pagination, modals, FloatingDock).
 * - Page heading, subtitle and "+ Add resource" primary action
 * - Four summary metric cards (derived from the dataset, never hardcoded)
 * - Directory card: search + category / access / status filters, date chip
 * - Resource table with Review action and pagination (6 per page)
 * - Details + Add/Edit modals with required-field validation
 *
 * ⚠️ LOCAL DEVELOPMENT PROTOTYPE — all data is mock and all add/edit
 * operations are in-memory only. This screen does NOT enforce anything:
 * no resource blocking, access granting/revocation, or security decisions
 * are performed here (those belong to the backend/security engine).
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../../components/ui'
import RestrictedResourcesTable from '../components/RestrictedResourcesTable'
import RestrictedResourceFilters from '../components/RestrictedResourceFilters'
import RestrictedResourceDetailsModal from '../components/RestrictedResourceDetailsModal'
import RestrictedResourceFormModal from '../components/RestrictedResourceFormModal'
import {
  useRestrictedResources,
  filterRestrictedResources,
} from '../hooks/useRestrictedResources'
import {
  SNAPSHOT_DATE,
} from '../data/mockSecurityPolicies'
import {
  RESTRICTED_CATEGORY_OPTIONS,
  RESTRICTED_ACCESS_OPTIONS,
  RESTRICTED_STATUS_OPTIONS,
  RESTRICTED_CATEGORY_TYPE_OPTIONS,
} from '../data/restrictedResourceOptions'
import type {
  AdminResourceRecord,
  RestrictedResourceFiltersState,
  RestrictedResourceFormValues,
} from '../types/restrictedResource.types'
import { DEFAULT_RESTRICTED_RESOURCE_FILTERS } from '../types/restrictedResource.types'
// Shared visual chassis of the security-management module (background,
// header, cards, toolbar, pagination, modal/form styles). Re-used as-is;
// resource-specific styles live in RestrictedResourcesTable.css.
import './SecurityPoliciesPage.css'

const PAGE_SIZE = 6

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

export const RestrictedResourcesPage: React.FC = () => {
  const {
    resources,
    summary,
    isLoading,
    lastUpdated,
    departments,
    createLocalResource,
    updateLocalResource,
  } = useRestrictedResources()

  const [filters, setFilters] = useState<RestrictedResourceFiltersState>(
    DEFAULT_RESTRICTED_RESOURCE_FILTERS,
  )
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminResourceRecord | null>(null)
  const [editor, setEditor] = useState<
    { mode: 'create' } | { mode: 'edit'; resource: AdminResourceRecord } | null
  >(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Apply all filters together, memoized.
  const filtered = useMemo(
    () => filterRestrictedResources(resources, filters),
    [resources, filters],
  )

  // Reset pagination when filters or dataset change.
  useEffect(() => {
    setPage(1)
  }, [filters, resources])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRecords = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.category !== 'all' ||
    filters.access !== 'all' ||
    filters.status !== 'all'

  /**
   * LOCAL DEVELOPMENT PROTOTYPE — append/patch in-memory mock records only.
   * Nothing is persisted, blocked, granted, or enforced.
   */
  const handleCreate = (values: RestrictedResourceFormValues) => {
    const created = createLocalResource(values)
    setEditor(null)
    if (created) {
      setFeedback(
        `"${created.name}" (${created.resourceId}) added as a local record — in-memory only, nothing enforced.`,
      )
    }
  }

  const handleUpdate = (values: RestrictedResourceFormValues) => {
    if (!editor || editor.mode !== 'edit') return
    const updated = updateLocalResource(editor.resource, values)
    setEditor(null)
    if (updated) {
      setFeedback(
        `"${updated.name}" (${updated.resourceId}) updated locally — changes are in-memory only.`,
      )
    }
  }

  return (
    <main className="secpol-page">
      <a className="secpol-skip-link" href="#secpol-content">Skip to main content</a>
      <span className="secpol-accent-dot" aria-hidden="true" />

      {/* ── Brand header (same as Security Policies / Admin Dashboard) ── */}
      <header className="secpol-brand-header">
        <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        <button className="secpol-profile-button" type="button" aria-label="Profile">
          <Icon name="user" size={21} />
        </button>
      </header>

      <div className="secpol-content" id="secpol-content">

        {/* ── Page header (same typography as Security Policies) ── */}
        <header className="secpol-page-header">
          <div>
            <h1>Restricted Resources</h1>
            <p>Review access classifications across websites, applications, tools, cloud resources, and databases.</p>
          </div>
          <div className="secpol-page-actions">
            <span title="All data on this screen is development mock data">Development mock data</span>
            <button
              type="button"
              className="secpol-btn-primary"
              onClick={() => setEditor({ mode: 'create' })}
            >
              <Icon name="plus" size={14} />
              Add resource
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

        {/* ── Summary metric cards (derived from the dataset) ── */}
        <section className="secpol-summary" aria-label="Restricted resource overview">
          <article className="secpol-metric">
            <span className="secpol-metric-label">Total resources</span>
            <strong className="secpol-metric-value" aria-label={`Total resources: ${summary.total}`}>
              {summary.total}
            </strong>
            <small className="secpol-metric-sub">Across all categories</small>
          </article>

          <article className="secpol-metric">
            <span className="secpol-metric-label">Restricted access</span>
            <strong className="secpol-metric-value" aria-label={`Restricted resources: ${summary.restricted}`}>
              {summary.restricted}
            </strong>
            <small className="secpol-metric-sub secpol-metric-sub--warning">
              Access currently limited
            </small>
          </article>

          <article className="secpol-metric">
            <span className="secpol-metric-label">Active resources</span>
            <strong className="secpol-metric-value" aria-label={`Active resources: ${summary.active}`}>
              {summary.active}
            </strong>
            <small className="secpol-metric-sub">Available for normal access</small>
          </article>

          <article className="secpol-metric">
            <span className="secpol-metric-label">Pending review</span>
            <strong className="secpol-metric-value" aria-label={`Pending review: ${summary.pending}`}>
              {summary.pending}
            </strong>
            <small className="secpol-metric-sub">Awaiting classification sign-off</small>
          </article>
        </section>

        {/* ── Restricted resource directory card ── */}
        <section className="secpol-library" aria-label="Restricted resource directory">
          <div className="secpol-library-head">
            <h2 className="secpol-library-title">Restricted resource directory</h2>
            <p className="secpol-library-sub">
              Classifications are visibility records and audit-tracked
              {' · '}Mock refreshed {lastUpdated}
            </p>
          </div>

          <div className="secpol-toolbar">
            <RestrictedResourceFilters
              filters={filters}
              onChange={setFilters}
              categories={RESTRICTED_CATEGORY_OPTIONS}
              accessLevels={RESTRICTED_ACCESS_OPTIONS}
              statuses={RESTRICTED_STATUS_OPTIONS}
              resultCount={filtered.length}
              totalCount={resources.length}
              snapshotDate={SNAPSHOT_DATE}
            />
          </div>

          <RestrictedResourcesTable
            resources={pageRecords}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onViewDetails={setSelected}
          />

          {/* ── Pagination ── */}
          <nav className="secpol-pagination" aria-label="Resource directory pagination">
            <span className="secpol-pagination__meta">
              Showing {pageRecords.length} of {filtered.length} resources
              {hasActiveFilters ? ` (filtered from ${resources.length})` : ''}
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

      </div>

      {/* ── Details modal ── */}
      <RestrictedResourceDetailsModal
        resource={selected}
        onClose={() => setSelected(null)}
        onEdit={(resource) => {
          setSelected(null)
          setEditor({ mode: 'edit', resource })
        }}
      />

      {/* ── Add / Edit modal (local development prototype) ── */}
      <RestrictedResourceFormModal
        isOpen={editor !== null}
        onClose={() => setEditor(null)}
        onSubmit={editor?.mode === 'edit' ? handleUpdate : handleCreate}
        mode={editor?.mode === 'edit' ? 'edit' : 'create'}
        initial={editor?.mode === 'edit' ? editor.resource : null}
        categories={RESTRICTED_CATEGORY_OPTIONS}
        typesByCategory={RESTRICTED_CATEGORY_TYPE_OPTIONS}
        accessLevels={RESTRICTED_ACCESS_OPTIONS}
        statuses={RESTRICTED_STATUS_OPTIONS}
        departments={departments}
      />
    </main>
  )
}

export default RestrictedResourcesPage
