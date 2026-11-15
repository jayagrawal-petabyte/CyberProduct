/**
 * BrainMint — Network Compliance Mock Data
 * Scope: src/features/security-management/data/mockNetworkCompliance.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * ⚠️ DEVELOPMENT MOCK DATA — these datasets are fictional snapshots that
 * exist purely to exercise the UI while backend integration is pending.
 * They do not represent a live network monitor or enforcement engine, and
 * no scanning, blocking or remediation is performed anywhere.
 *
 * Self-consistency note: zone connection counts and compliance percentages
 * are the single source for every summary metric on the page (weighted
 * score, trusted/blocked counts, zones monitored) — see
 * hooks/useNetworkCompliance.ts → summarizeNetworkCompliance().
 */

import type {
  EnforcementEventRecord,
  NetworkControlRecord,
  NetworkZoneRecord,
} from '../types/networkCompliance.types'

/** Dev snapshot labels (same convention as the Security Policies screen). */
export const COMPLIANCE_SNAPSHOT_DATE = '24 Oct 2026'
export const COMPLIANCE_SNAPSHOT_TIME = '24 Oct, 08:42 UTC'

/** Eight monitored network zones (mock snapshot). */
export const MOCK_NETWORK_ZONES: NetworkZoneRecord[] = [
  {
    id: 'nz-001',
    zone: 'Acme Corporate VPN',
    kind: 'vpn',
    connections: 96,
    compliancePct: 100,
    status: 'trusted',
  },
  {
    id: 'nz-002',
    zone: 'San Francisco HQ',
    kind: 'office',
    connections: 58,
    compliancePct: 98,
    status: 'trusted',
  },
  {
    id: 'nz-003',
    zone: 'London Office',
    kind: 'office',
    connections: 41,
    compliancePct: 95,
    status: 'trusted',
  },
  {
    id: 'nz-004',
    zone: 'Cloud Data Center Edge',
    kind: 'cloud',
    connections: 33,
    compliancePct: 97,
    status: 'trusted',
  },
  {
    id: 'nz-005',
    zone: 'Berlin Office',
    kind: 'office',
    connections: 27,
    compliancePct: 92,
    status: 'watch',
  },
  {
    id: 'nz-006',
    zone: 'Guest Wi-Fi Network',
    kind: 'guest',
    connections: 18,
    compliancePct: 64,
    status: 'watch',
  },
  {
    id: 'nz-007',
    zone: 'Remote / Untrusted',
    kind: 'untrusted',
    connections: 12,
    compliancePct: 30,
    status: 'restricted',
  },
  {
    id: 'nz-008',
    zone: 'Partner VPN Tunnel',
    kind: 'partner',
    connections: 9,
    compliancePct: 45,
    status: 'restricted',
  },
]

/**
 * Security control health (separate mock data source — not derived from
 * zones). `state` must stay consistent with valuePct thresholds:
 * ≥90 healthy · 75–89 watch · <75 at-risk.
 */
export const MOCK_NETWORK_CONTROLS: NetworkControlRecord[] = [
  {
    id: 'nc-001',
    name: 'VPN enforcement',
    description: 'Connections on unmanaged networks must ride the corporate VPN.',
    valuePct: 96,
    state: 'healthy',
  },
  {
    id: 'nc-002',
    name: 'TLS 1.2+ encryption',
    description: 'Share of monitored connections agreeing on TLS 1.2 or newer.',
    valuePct: 99,
    state: 'healthy',
  },
  {
    id: 'nc-003',
    name: 'DNS protection',
    description: 'Resolvers using the protected DNS tier with sinkholing.',
    valuePct: 91,
    state: 'healthy',
  },
  {
    id: 'nc-004',
    name: 'Device trust',
    description: 'Managed devices holding a valid device-trust certificate.',
    valuePct: 88,
    state: 'watch',
  },
  {
    id: 'nc-005',
    name: 'Geo-risk checks',
    description: 'Sessions screened against the geo-risk watchlist.',
    valuePct: 74,
    state: 'at-risk',
  },
]

/**
 * Recent enforcement activity (separate mock data source — the page renders
 * it verbatim; nothing here was actually blocked or remediated).
 */
export const MOCK_ENFORCEMENT_EVENTS: EnforcementEventRecord[] = [
  {
    id: 'ne-001',
    title: 'Untrusted connection blocked',
    description: 'Session from an unrecognized residential ASN refused at the VPN trust rule.',
    severity: 'blocked',
    timestamp: '2 min ago',
    zoneName: 'Remote / Untrusted',
  },
  {
    id: 'ne-002',
    title: 'VPN trust revalidated',
    description: 'Corporate VPN certificate chain re-validated; all concentrators trusted.',
    severity: 'success',
    timestamp: '26 min ago',
    zoneName: 'Acme Corporate VPN',
  },
  {
    id: 'ne-003',
    title: 'TLS downgrade attempt blocked',
    description: 'Legacy TLS 1.0 handshake from a guest device rejected by policy.',
    severity: 'blocked',
    timestamp: '1 hr ago',
    zoneName: 'Guest Wi-Fi Network',
  },
  {
    id: 'ne-004',
    title: 'Geo-risk check escalated',
    description: 'Sign-in attempt from an unusual region flagged for analyst review.',
    severity: 'warning',
    timestamp: '3 hrs ago',
    zoneName: 'London Office',
  },
  {
    id: 'ne-005',
    title: 'DNS protection updated',
    description: 'Fresh malicious-domain sinkhole list applied to protected resolvers.',
    severity: 'success',
    timestamp: '5 hrs ago',
    zoneName: 'Acme Corporate VPN',
  },
  {
    id: 'ne-006',
    title: 'Device trust revoked',
    description: 'Expired device-trust certificate on a managed laptop revoked.',
    severity: 'blocked',
    timestamp: 'Yesterday',
    zoneName: 'San Francisco HQ',
  },
]

/** Status filter option values for the zones table. */
export const NETWORK_ZONE_STATUS_OPTIONS = ['trusted', 'watch', 'restricted'] as const
