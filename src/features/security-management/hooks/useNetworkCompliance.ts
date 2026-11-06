/**
 * BrainMint — Network Compliance Data Hook
 * Scope: src/features/security-management/hooks/useNetworkCompliance.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * ⚠️ DEVELOPMENT MOCK DATA — serves the mock zone/controls/enforcement
 * datasets with a simulated latency window so loading states can be
 * exercised. Not a live network monitor; performs NO scanning, VPN
 * enforcement, connection blocking, or remediation.
 *
 * "Run assessment"/refresh is a local prototype affordance only — it re-serves
 * the same static mock snapshot and never claims a real assessment ran.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  ComplianceSummary,
  NetworkZoneFiltersState,
  NetworkZoneRecord,
} from '../types/networkCompliance.types'
import {
  MOCK_ENFORCEMENT_EVENTS,
  MOCK_NETWORK_CONTROLS,
  MOCK_NETWORK_ZONES,
} from '../data/mockNetworkCompliance'

export interface UseNetworkComplianceResult {
  zones: NetworkZoneRecord[]
  controls: typeof MOCK_NETWORK_CONTROLS
  events: typeof MOCK_ENFORCEMENT_EVENTS
  summary: ComplianceSummary
  isLoading: boolean
  /** Dev-only indicator string; the dataset is a mock snapshot. */
  lastUpdated: string
  refetch: () => void
}

/**
 * Reusable client-side filtering. Search matches the zone name; the status
 * filter combines with AND semantics.
 */
export function filterNetworkZones(
  zones: NetworkZoneRecord[],
  filters: NetworkZoneFiltersState,
): NetworkZoneRecord[] {
  const q = filters.search.trim().toLowerCase()
  return zones.filter((zone) => {
    const matchesSearch = !q || zone.zone.toLowerCase().includes(q)
    const matchesStatus = filters.status === 'all' || zone.status === filters.status
    return matchesSearch && matchesStatus
  })
}

/**
 * Derives the summary-card metrics from the zones dataset — never hardcoded:
 *  - Compliance score: connection-weighted mean of zone compliance
 *  - Trusted connections: connections on trusted zones
 *  - Blocked connections: connections on restricted zones
 *  - Networks monitored: zone count
 */
export function summarizeNetworkCompliance(
  zones: NetworkZoneRecord[],
): ComplianceSummary {
  let totalConnections = 0
  let trustedConnections = 0
  let blockedConnections = 0
  let watchConnections = 0
  let weightedCompliance = 0

  for (const zone of zones) {
    totalConnections += zone.connections
    weightedCompliance += zone.compliancePct * zone.connections
    if (zone.status === 'trusted') trustedConnections += zone.connections
    else if (zone.status === 'restricted') blockedConnections += zone.connections
    else watchConnections += zone.connections
  }

  const complianceScorePct =
    totalConnections > 0 ? Math.round(weightedCompliance / totalConnections) : 0

  return {
    totalConnections,
    trustedConnections,
    blockedConnections,
    watchConnections,
    zonesMonitored: zones.length,
    complianceScorePct,
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

export function useNetworkCompliance(): UseNetworkComplianceResult {
  const [zones, setZones] = useState<NetworkZoneRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('—')

  // Simulated initial fetch of the mock datasets.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setZones(MOCK_NETWORK_ZONES)
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    window.setTimeout(() => {
      // Mock "refresh": re-serve the same static snapshot with a new stamp.
      setZones([...MOCK_NETWORK_ZONES])
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 350)
  }, [])

  const summary = useMemo(() => summarizeNetworkCompliance(zones), [zones])

  return {
    zones,
    controls: MOCK_NETWORK_CONTROLS,
    events: MOCK_ENFORCEMENT_EVENTS,
    summary,
    isLoading,
    lastUpdated,
    refetch,
  }
}

export { MOCK_ENFORCEMENT_EVENTS, MOCK_NETWORK_CONTROLS }
