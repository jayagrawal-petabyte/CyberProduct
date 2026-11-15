/**
 * BrainMint — Security Policies Types
 * Scope: src/features/security-management/types/policy.types.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * NOTE ON REUSE: modelled on the Admin policy-directory types recovered from
 * git stash@{0} ("hold admin policy module for future reuse"), redesigned for
 * the Security Policies screen: version tracking, lifecycle states and
 * enforcement modes replace the Admin priority/group fields.
 *
 * ⚠️ This record type is for administrative VISIBILITY and mock authoring
 * only. Nothing on this screen enforces a policy — no website blocking,
 * application blocking, or access decisions are driven by this data.
 */

/** Lifecycle state of a security policy in the library. */
export type PolicyState =
  | 'published'      // green dot on screen
  | 'under-review'   // amber dot (supported by data model / form; not in current snapshot)
  | 'draft'          // grey dot
  | 'retired'        // red dot (supported by data model / form; not in current snapshot)

/** How the policy is (or is not) put into effect once published. */
export type EnforcementMode =
  | 'Acknowledgment'
  | 'Automatic: Blocking'
  | 'Automatic: Expiration'
  | 'Not enforced'

/** Thematic grouping used by the category filter and Create/Edit form. */
export type PolicyCategory =
  | 'Acceptable Use'
  | 'Device Security'
  | 'Data Handling'
  | 'Access Control'
  | 'Network Security'

/**
 * A single security policy in the library.
 *
 * `ackCurrent`/`ackTarget`/`ackDue` are only meaningful when
 * enforcement === 'Acknowledgment'; they feed the workforce-metrics cards
 * and the rollout reminder banner. No real acknowledgment flow exists —
 * these are mock-workforce snapshot numbers.
 */
export interface SecurityPolicyRecord {
  /** Internal record id. */
  id: string
  /** Business-facing identifier, e.g. "POL-101". */
  policyId: string
  name: string
  description: string
  /** Version label, e.g. "v3.2". */
  version: string
  category: PolicyCategory
  state: PolicyState
  enforcement: EnforcementMode
  /** Policy owner / publishing author shown under the policy name. */
  ownerName: string
  /** workforce scope label, e.g. "All workspaces". */
  scope: string
  /** Display date the current version took effect, e.g. "22 Oct 2026". */
  effectiveFrom: string
  /** Display "updated" label for the table's UPDATED column. */
  updatedOn: string
  /** ISO date (YYYY-MM-DD) backing deterministic sorting of `updatedOn`. */
  updatedDate: string
  /** Users who have acknowledged the current version (mock workforce). */
  ackCurrent: number
  /** Total users in scope for acknowledgment (mock workforce). */
  ackTarget: number
  /** Display acknowledgment due date, e.g. "26 Oct 2026". */
  ackDue?: string
}

/**
 * Values collected by the Create policy / Edit policy form.
 * Record ids, owner and audit dates are assigned by the data hook.
 */
export type PolicyFormValues = Pick<
  SecurityPolicyRecord,
  'name' | 'description' | 'version' | 'category' | 'state' | 'enforcement' | 'scope'
>

/** Payload for locally created policies (in-memory drafts only). */
export type PolicyCreateDraft = Omit<
  SecurityPolicyRecord,
  'id' | 'policyId' | 'ownerName' | 'updatedOn' | 'updatedDate'
>

/** Client-side filter state for the policy library. */
export interface PolicyFiltersState {
  /** Matches policy name or policy ID (case-insensitive). */
  search: string
  /** `PolicyState` value or 'all'. */
  state: string
  /** Category name or 'all'. */
  category: string
}

/** Default (empty) filter state. */
export const DEFAULT_POLICY_FILTERS: PolicyFiltersState = {
  search: '',
  state: 'all',
  category: 'all',
}

/** Display labels for lifecycle states. */
export const POLICY_STATE_LABELS: Record<PolicyState, string> = {
  published: 'Published',
  'under-review': 'Under review',
  draft: 'Draft',
  retired: 'Retired',
}

/** Display labels for enforcement modes. */
export const POLICY_ENFORCEMENT_LABELS: Record<EnforcementMode, string> = {
  'Acknowledgment': 'Acknowledgment',
  'Automatic: Blocking': 'Automatic: Blocking',
  'Automatic: Expiration': 'Automatic: Expiration',
  'Not enforced': 'Not enforced',
}

/**
 * Derived library metrics — computed from the dataset, never hardcoded.
 * Mirrors the four summary cards on the approved design: Active policies,
 * Acknowledgment rate, Pending acknowledgments, Draft policies.
 */
export interface PolicySummaryMetrics {
  /** Total policies in the (filtered or full) dataset. */
  total: number
  /** Count of `published` policies ("Active policies"). */
  published: number
  /** Count of `draft` policies. */
  drafts: number
  /** Mock-workforce acknowledgment percentage (rounded). */
  ackRatePct: number
  /** Users still to acknowledge the rollout policy. */
  pendingUsers: number
  /** Users up to date ("228 of 248 users up to date"). */
  ackCurrent: number
  /** Workforce universe ("248"). */
  ackTarget: number
  /** The published Acknowledgment policy driving the rollout banner, if any. */
  rollout: SecurityPolicyRecord | null
}
