/**
 * BrainMint — Security Policies Data Hook
 * Scope: src/features/security-management/hooks/useSecurityPolicies.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * ⚠️ DEVELOPMENT MOCK DATA — serves the mock policy library with a simulated
 * latency window so loading states can be exercised. This is not a live
 * security-engine connection and performs no enforcement of any kind.
 *
 * Local create/edit operations are in-memory ONLY: records made through the
 * form are temporary mock drafts, cleared on reload, never saved to a
 * backend. This mirrors the local-prototype convention used across the app.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  PolicyCreateDraft,
  PolicyFiltersState,
  PolicyFormValues,
  PolicyState,
  PolicySummaryMetrics,
  SecurityPolicyRecord,
} from '../types/policy.types'
import {
  MOCK_SECURITY_POLICIES,
  SNAPSHOT_DATE,
  WORKFORCE_TOTAL_USERS,
} from '../data/mockSecurityPolicies'

export interface UseSecurityPoliciesResult {
  policies: SecurityPolicyRecord[]
  summary: PolicySummaryMetrics
  isLoading: boolean
  /** Dev-only indicator string; the dataset is mock data, not an engine. */
  lastUpdated: string
  refetch: () => void
  /** LOCAL PROTOTYPE ONLY — appends a temporary library record. */
  createLocalPolicy: (draft: PolicyCreateDraft, authorName: string) => SecurityPolicyRecord
  /** LOCAL PROTOTYPE ONLY — applies a form edit to an existing record. */
  updateLocalPolicy: (existing: SecurityPolicyRecord, values: PolicyFormValues) => SecurityPolicyRecord
}

/** Sort rank so published rows lead the library, as in the approved design. */
const STATE_SORT_RANK: Record<PolicyState, number> = {
  published: 0,
  'under-review': 1,
  draft: 2,
  retired: 3,
}

/**
 * Orders the library for display: published policies first (newest update
 * first), then drafts. ISO `updatedDate` strings sort correctly as text.
 */
export function sortPolicies(
  policies: SecurityPolicyRecord[],
): SecurityPolicyRecord[] {
  return [...policies].sort((a, b) => {
    const rank = STATE_SORT_RANK[a.state] - STATE_SORT_RANK[b.state]
    if (rank !== 0) return rank
    return b.updatedDate.localeCompare(a.updatedDate)
  })
}

/**
 * Reusable client-side filtering. Search matches policy name or policy ID;
 * the state and category filters combine with AND semantics.
 */
export function filterPolicies(
  policies: SecurityPolicyRecord[],
  filters: PolicyFiltersState,
): SecurityPolicyRecord[] {
  const q = filters.search.trim().toLowerCase()
  return policies.filter((policy) => {
    const matchesSearch =
      !q ||
      policy.name.toLowerCase().includes(q) ||
      policy.policyId.toLowerCase().includes(q)
    const matchesState = filters.state === 'all' || policy.state === filters.state
    const matchesCategory =
      filters.category === 'all' || policy.category === filters.category
    return matchesSearch && matchesState && matchesCategory
  })
}

/**
 * Derives the summary-card metrics from the dataset — never hardcoded:
 *  - Active policies: count of published records
 *  - Acknowledgment rate / pending: workforce snapshot in mock data
 *  - Draft policies: count of draft records
 */
export function summarizePolicies(policies: SecurityPolicyRecord[]): PolicySummaryMetrics {
  let published = 0
  let drafts = 0
  let ackCurrent = 0
  let ackTarget = 0
  let rollout: SecurityPolicyRecord | null = null

  for (const policy of policies) {
    if (policy.state === 'published') {
      published += 1
      if (policy.enforcement === 'Acknowledgment') {
        ackCurrent += policy.ackCurrent
        ackTarget += policy.ackTarget
      }
    } else if (policy.state === 'draft') {
      drafts += 1
    }

    // Rollout banner candidate: published + acknowledgment due + outstanding.
    if (
      policy.state === 'published' &&
      policy.enforcement === 'Acknowledgment' &&
      policy.ackDue !== undefined &&
      policy.ackTarget - policy.ackCurrent > 0
    ) {
      if (!rollout || policy.ackTarget - policy.ackCurrent > rollout.ackTarget - rollout.ackCurrent) {
        rollout = policy
      }
    }
  }

  // Banner metrics come from the single rollout policy, not the full sum.
  const bannerPolicy = rollout
  const pendingUsers = bannerPolicy ? bannerPolicy.ackTarget - bannerPolicy.ackCurrent : 0
  const rateCurrent = bannerPolicy ? bannerPolicy.ackCurrent : 0
  const rateTarget = bannerPolicy && bannerPolicy.ackTarget > 0 ? bannerPolicy.ackTarget : 0
  const ackRatePct =
    rateTarget > 0 ? Math.round((rateCurrent / rateTarget) * 100) : 0

  return {
    total: policies.length,
    published,
    drafts,
    ackRatePct,
    pendingUsers,
    ackCurrent: rateCurrent,
    ackTarget: rateTarget,
    rollout: bannerPolicy,
  }
}

/** Timestamp for the "mock refreshed" indicator. */
function timestamp(): string {
  return (
    new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' UTC'
  )
}

/** ISO date backing local records' sort order. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Normalizes free-typed versions ("3.0") into BrainMint labels ("v3.0"). */
function normalizeVersion(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return 'v0.1'
  return trimmed.startsWith('v') || trimmed.startsWith('V') ? trimmed : `v${trimmed}`
}

/** Monotonic suffix backing locally generated policy IDs (POL-115, …). */
let localPolicySeq = 0

export function useSecurityPolicies(): UseSecurityPoliciesResult {
  const [policies, setPolicies] = useState<SecurityPolicyRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('—')

  // Simulated initial fetch of the mock dataset.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPolicies(MOCK_SECURITY_POLICIES)
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    window.setTimeout(() => {
      setPolicies((prev) => [...prev])
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 350)
  }, [])

  /**
   * LOCAL PROTOTYPE ONLY — appends a temporary mock record to the in-memory
   * dataset. Not persisted; cleared on page reload; never enforced.
   */
  const createLocalPolicy = useCallback(
    (draft: PolicyCreateDraft, authorName: string): SecurityPolicyRecord => {
      localPolicySeq += 1
      const record: SecurityPolicyRecord = {
        ...draft,
        id: `sp-tmp-${localPolicySeq}`,
        policyId: `POL-${115 + localPolicySeq - 1}`,
        ownerName: authorName || 'Priya Shah',
        version: normalizeVersion(draft.version),
        updatedOn: 'Just now (local draft)',
        updatedDate: todayIso(),
      }
      setPolicies((prev) => [record, ...prev])
      return record
    },
    [],
  )

  /**
   * LOCAL PROTOTYPE ONLY — patches an existing in-memory record.
   * The library never modifies enforcement behaviour on any system.
   */
  const updateLocalPolicy = useCallback(
    (existing: SecurityPolicyRecord, values: PolicyFormValues): SecurityPolicyRecord => {
      const updated: SecurityPolicyRecord = {
        ...existing,
        ...values,
        version: normalizeVersion(values.version),
        updatedOn: 'Just now (local edit)',
        updatedDate: todayIso(),
      }
      setPolicies((prev) =>
        prev.map((policy) => (policy.id === updated.id ? updated : policy)),
      )
      return updated
    },
    [],
  )

  const sorted = useMemo(() => sortPolicies(policies), [policies])
  const summary = useMemo(() => summarizePolicies(policies), [policies])

  return {
    policies: sorted,
    summary,
    isLoading,
    lastUpdated,
    refetch,
    createLocalPolicy,
    updateLocalPolicy,
  }
}

export { SNAPSHOT_DATE, WORKFORCE_TOTAL_USERS }
