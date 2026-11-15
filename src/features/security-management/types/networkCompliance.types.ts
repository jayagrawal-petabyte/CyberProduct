/**
 * BrainMint — Network Compliance Types
 * Scope: src/features/security-management/types/networkCompliance.types.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * ⚠️ Records are for administrative VISIBILITY and mock review only.
 * Nothing on this screen scans networks, enforces VPN rules, blocks
 * connections, or performs any security remediation — those belong to the
 * backend/security engine.
 */

/** Trust status of a monitored network zone. */
export type NetworkZoneStatus =
  | 'trusted'    // green
  | 'watch'      // amber — compliance below the healthy threshold
  | 'restricted' // red — untrusted/partner quarantine

/** Zone classification driving the row chip icon. */
export type NetworkZoneKind =
  | 'vpn'      // corporate VPN concentrators
  | 'office'   // physical office / HQ networks
  | 'cloud'    // cloud data-center edges
  | 'guest'    // guest Wi-Fi networks
  | 'partner'  // partner tunnels
  | 'untrusted'

/** A monitored network zone ("Acme Corporate VPN", …). */
export interface NetworkZoneRecord {
  id: string
  /** Display name of the zone. */
  zone: string
  kind: NetworkZoneKind
  /** Active connections observed in the mock snapshot. */
  connections: number
  /** Compliance percentage of the zone (mock snapshot). */
  compliancePct: number
  status: NetworkZoneStatus
}

/** Health state of a network security control. */
export type ControlState = 'healthy' | 'watch' | 'at-risk'

/** A security control tracked on the Control Health panel. */
export interface NetworkControlRecord {
  id: string
  name: string
  description: string
  /** Health percentage (mock snapshot) driving the progress bar. */
  valuePct: number
  state: ControlState
}

/** Severity of a recent enforcement event (icon treatment). */
export type EnforcementSeverity = 'blocked' | 'warning' | 'success'

/** One row of the Recent Enforcement panel (separate mock data source). */
export interface EnforcementEventRecord {
  id: string
  title: string
  description: string
  severity: EnforcementSeverity
  /** Display timestamp label, e.g. "2 min ago · 24 Oct, 08:42 UTC". */
  timestamp: string
  /** Zone label shown under the description (informational). */
  zoneName?: string
}

/** Client-side filter state for the zones table. */
export interface NetworkZoneFiltersState {
  search: string
  status: string
}

/** Default (empty) filter state. */
export const DEFAULT_NETWORK_ZONE_FILTERS: NetworkZoneFiltersState = {
  search: '',
  status: 'all',
}

/** Display labels for zone statuses. */
export const NETWORK_ZONE_STATUS_LABELS: Record<NetworkZoneStatus, string> = {
  trusted: 'Trusted',
  watch: 'Watch',
  restricted: 'Restricted',
}

/** Display labels for zone kinds (sub-line under the zone name). */
export const NETWORK_ZONE_KIND_LABELS: Record<NetworkZoneKind, string> = {
  vpn: 'VPN',
  office: 'Corporate network',
  cloud: 'Cloud edge',
  guest: 'Guest network',
  partner: 'Partner link',
  untrusted: 'Untrusted',
}

/** Display labels for control states. */
export const CONTROL_STATE_LABELS: Record<ControlState, string> = {
  healthy: 'Healthy',
  watch: 'Watch',
  'at-risk': 'At risk',
}

/**
 * Derived page metrics — computed from the dataset, never hardcoded.
 *  - Compliance score: connection-weighted average of zone compliance
 *  - Trusted connections: connections on `trusted` zones
 *  - Blocked connections: connections on `restricted` zones
 *  - Networks monitored: zone count
 */
export interface ComplianceSummary {
  totalConnections: number
  trustedConnections: number
  blockedConnections: number
  watchConnections: number
  zonesMonitored: number
  complianceScorePct: number
}
