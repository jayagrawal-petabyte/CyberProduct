/**
 * BrainMint — Security Policies Mock Dataset
 * Scope: src/features/security-management/data/mockSecurityPolicies.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * ⚠️ DEVELOPMENT MOCK DATA — this dataset is fictional and exists purely to
 * exercise the Security Policies UI while backend integration is pending.
 * Records listed here are NOT enforced: no website blocking, application
 * blocking, acknowledgment chasing, or access decisions are driven by this
 * data. It contains no secrets. The "workforce" figures are a mock snapshot.
 */

import { PolicyCategory, SecurityPolicyRecord } from '../types/policy.types'

/** Snapshot date shown in the library toolbar date chip. */
export const SNAPSHOT_DATE = '24 Oct 2026'

/** Display date for the scheduled policy reminder (mock scheduler). */
export const SNAPSHOT_NEXT_REMINDER = '26 Oct, 08:00 UTC'

/** Mock workforce universe used by acknowledgment metrics ("248 users"). */
export const WORKFORCE_TOTAL_USERS = 248

/**
 * The library is ordered to match the approved design: published policies
 * first (newest update first), then drafts — "Showing 6 of 14 policies".
 */
export const MOCK_SECURITY_POLICIES: SecurityPolicyRecord[] = [
  {
    id: 'sp-101',
    policyId: 'POL-101',
    name: 'Acceptable Use',
    description:
      'Sets acceptable-use expectations for every workstation, application and network session across the organization.',
    version: 'v3.2',
    category: 'Acceptable Use',
    state: 'published',
    enforcement: 'Acknowledgment',
    ownerName: 'Priya Shah',
    scope: 'All workspaces',
    effectiveFrom: '22 Oct 2026',
    updatedOn: '22 Oct 2026',
    updatedDate: '2026-10-22',
    ackCurrent: 228,
    ackTarget: WORKFORCE_TOTAL_USERS,
    ackDue: '26 Oct 2026',
  },
  {
    id: 'sp-102',
    policyId: 'POL-102',
    name: 'Device Security Baseline',
    description:
      'Baseline device hygiene: disk encryption, screen-lock, updated OS builds and managed antivirus on every endpoint.',
    version: 'v2.4',
    category: 'Device Security',
    state: 'published',
    enforcement: 'Automatic: Blocking',
    ownerName: 'Priya Shah',
    scope: 'All managed endpoints',
    effectiveFrom: '01 Oct 2026',
    updatedOn: '01 Oct 2026',
    updatedDate: '2026-10-01',
    ackCurrent: 0,
    ackTarget: 0,
  },
  {
    id: 'sp-103',
    policyId: 'POL-103',
    name: 'Data Handling & Classification',
    description:
      'Classification tiers for customer, financial and HR data, plus handling rules for storage, transfer and retention.',
    version: 'v4.1',
    category: 'Data Handling',
    state: 'published',
    enforcement: 'Acknowledgment',
    ownerName: 'Priya Shah',
    scope: 'All workspaces',
    effectiveFrom: '15 Sep 2026',
    updatedOn: '15 Sep 2026',
    updatedDate: '2026-09-15',
    ackCurrent: 240,
    ackTarget: WORKFORCE_TOTAL_USERS,
    ackDue: '20 Nov 2026',
  },
  {
    id: 'sp-104',
    policyId: 'POL-104',
    name: 'Remote Access & MFA',
    description:
      'VPN gateways, hardware-key MFA requirements and session rules for anyone reaching internal systems remotely.',
    version: 'v2.0',
    category: 'Access Control',
    state: 'published',
    enforcement: 'Automatic: Blocking',
    ownerName: 'Priya Shah',
    scope: 'Remote workforce',
    effectiveFrom: '01 Sep 2026',
    updatedOn: '01 Sep 2026',
    updatedDate: '2026-09-01',
    ackCurrent: 0,
    ackTarget: 0,
  },
  {
    id: 'sp-105',
    policyId: 'POL-105',
    name: 'Time-bound Resource Access',
    description:
      'Grants to time-boxed resources expire automatically; renewals require an approved access request.',
    version: 'v1.8',
    category: 'Access Control',
    state: 'published',
    enforcement: 'Automatic: Expiration',
    ownerName: 'Priya Shah',
    scope: 'All workspaces',
    effectiveFrom: '15 Aug 2026',
    updatedOn: '15 Aug 2026',
    updatedDate: '2026-08-15',
    ackCurrent: 0,
    ackTarget: 0,
  },
  {
    id: 'sp-106',
    policyId: 'POL-106',
    name: 'Privileged Session Review',
    description:
      'Draft walkthrough for reviewing administrative and break-glass sessions before they are auto-approved.',
    version: 'v0.9',
    category: 'Access Control',
    state: 'draft',
    enforcement: 'Not enforced',
    ownerName: 'Priya Shah',
    scope: 'Privileged accounts',
    effectiveFrom: 'Not yet effective',
    updatedOn: '23 Oct 2026',
    updatedDate: '2026-10-23',
    ackCurrent: 0,
    ackTarget: 0,
  },
  {
    id: 'sp-107',
    policyId: 'POL-107',
    name: 'Cloud Storage Governance',
    description:
      'Approved cloud storage providers and content rules; unmanaged consumer sync apps are blocked automatically.',
    version: 'v1.2',
    category: 'Data Handling',
    state: 'published',
    enforcement: 'Automatic: Blocking',
    ownerName: 'Priya Shah',
    scope: 'All workspaces',
    effectiveFrom: '30 Jul 2026',
    updatedOn: '30 Jul 2026',
    updatedDate: '2026-07-30',
    ackCurrent: 0,
    ackTarget: 0,
  },
  {
    id: 'sp-108',
    policyId: 'POL-108',
    name: 'Contractor Onboarding Security',
    description:
      'Security induction checklist contractors must acknowledge before gaining access to any internal resource.',
    version: 'v1.0',
    category: 'Access Control',
    state: 'published',
    enforcement: 'Acknowledgment',
    ownerName: 'Priya Shah',
    scope: 'Contractors',
    effectiveFrom: '14 Jul 2026',
    updatedOn: '14 Jul 2026',
    updatedDate: '2026-07-14',
    ackCurrent: 231,
    ackTarget: 248,
    ackDue: '12 Nov 2026',
  },
  {
    id: 'sp-109',
    policyId: 'POL-109',
    name: 'Email & Phishing Defense',
    description:
      'Mail hygiene rules, external-sender banners, and automatic blocking of known phishing and spoofing patterns.',
    version: 'v2.1',
    category: 'Acceptable Use',
    state: 'published',
    enforcement: 'Automatic: Blocking',
    ownerName: 'Priya Shah',
    scope: 'All mailboxes',
    effectiveFrom: '28 Jun 2026',
    updatedOn: '28 Jun 2026',
    updatedDate: '2026-06-28',
    ackCurrent: 0,
    ackTarget: 0,
  },
  {
    id: 'sp-110',
    policyId: 'POL-110',
    name: 'Portable Media Encryption',
    description:
      'USB drives and portable media must be centrally encrypted; unencrypted devices are rejected at mount time.',
    version: 'v1.4',
    category: 'Device Security',
    state: 'published',
    enforcement: 'Automatic: Blocking',
    ownerName: 'Priya Shah',
    scope: 'All workspaces',
    effectiveFrom: '12 Jun 2026',
    updatedOn: '12 Jun 2026',
    updatedDate: '2026-06-12',
    ackCurrent: 0,
    ackTarget: 0,
  },
  {
    id: 'sp-111',
    policyId: 'POL-111',
    name: 'Incident Response Escalation',
    description:
      'Who is notified, in which order, and how fast, when a security incident is declared anywhere in the estate.',
    version: 'v1.5',
    category: 'Access Control',
    state: 'published',
    enforcement: 'Acknowledgment',
    ownerName: 'Priya Shah',
    scope: 'On-call responders',
    effectiveFrom: '26 May 2026',
    updatedOn: '26 May 2026',
    updatedDate: '2026-05-26',
    ackCurrent: 245,
    ackTarget: 248,
    ackDue: '30 Nov 2026',
  },
  {
    id: 'sp-112',
    policyId: 'POL-112',
    name: 'Guest Network Isolation',
    description:
      'Guest wireless traffic is segmented from corporate VLANs; lateral movement attempts are blocked at the switch.',
    version: 'v1.1',
    category: 'Network Security',
    state: 'published',
    enforcement: 'Automatic: Blocking',
    ownerName: 'Priya Shah',
    scope: 'Office networks',
    effectiveFrom: '20 May 2026',
    updatedOn: '20 May 2026',
    updatedDate: '2026-05-20',
    ackCurrent: 0,
    ackTarget: 0,
  },
  {
    id: 'sp-113',
    policyId: 'POL-113',
    name: 'Legacy VPN Retirement',
    description:
      'Draft migration plan to retire the legacy split-tunnel VPN in favour of the zero-trust access gateway.',
    version: 'v0.5',
    category: 'Network Security',
    state: 'draft',
    enforcement: 'Not enforced',
    ownerName: 'Priya Shah',
    scope: 'Remote workforce',
    effectiveFrom: 'Not yet effective',
    updatedOn: '21 Oct 2026',
    updatedDate: '2026-10-21',
    ackCurrent: 0,
    ackTarget: 0,
  },
  {
    id: 'sp-114',
    policyId: 'POL-114',
    name: 'Social Media Usage Limits',
    description:
      'Reasonable personal social-media use on corporate devices, focused on bandwidth considerations and productivity.',
    version: 'v1.0',
    category: 'Acceptable Use',
    state: 'published',
    enforcement: 'Acknowledgment',
    ownerName: 'Priya Shah',
    scope: 'All workspaces',
    effectiveFrom: '02 May 2026',
    updatedOn: '02 May 2026',
    updatedDate: '2026-05-02',
    ackCurrent: 246,
    ackTarget: WORKFORCE_TOTAL_USERS,
    ackDue: '04 Nov 2026',
  },
]

/** Category options for the category filter dropdown (derived once). */
export const POLICY_CATEGORY_OPTIONS: PolicyCategory[] = Array.from(
  new Set(MOCK_SECURITY_POLICIES.map((p) => p.category)),
) as PolicyCategory[]

/** Enforcement-mode options for the Create/Edit form (fixed taxonomy). */
export const POLICY_ENFORCEMENT_OPTIONS = [
  'Acknowledgment',
  'Automatic: Blocking',
  'Automatic: Expiration',
  'Not enforced',
] as const
