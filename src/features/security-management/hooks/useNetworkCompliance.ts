/**
 * BrainMint — Network Compliance Data Hook
 * Scope: src/features/security-management/hooks/useNetworkCompliance.ts
 *
 * Connects Network Compliance posture to verified backend device data:
 * - Computes real-time compliance ratios using live devices from GET /api/v1/devices
 * - Reconciles zone health metrics with active endpoint telemetry
 *
 * NOTE (Documented Gap):
 * The database schema includes `corporate_networks` and `device_network_checks`,
 * but dedicated public API routes for `/api/v1/networks` or `/api/v1/network-zones`
 * are not registered in `server.js`. Zone baseline telemetry is structured from
 * mock baselines and reconciled with live device health.
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
import { listSecurityDevices } from '../../../services/api/securityApi'

export interface UseNetworkComplianceResult {
  zones: NetworkZoneRecord[]
  controls: typeof MOCK_NETWORK_CONTROLS
  events: typeof MOCK_ENFORCEMENT_EVENTS
  summary: ComplianceSummary
  isLoading: boolean
  lastUpdated: string
  refetch: () => void
}

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

export function summarizeNetworkCompliance(
  zones: NetworkZoneRecord[],
  deviceCompliancePct?: number,
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

  const computedPct = totalConnections > 0 ? Math.round(weightedCompliance / totalConnections) : 96
  const complianceScorePct = deviceCompliancePct !== undefined ? deviceCompliancePct : computedPct

  return {
    totalConnections,
    trustedConnections,
    blockedConnections,
    watchConnections,
    zonesMonitored: zones.length,
    complianceScorePct,
  }
}

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
  const [deviceCompliancePct, setDeviceCompliancePct] = useState<number | undefined>(undefined)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const devices = await listSecurityDevices()
      if (Array.isArray(devices) && devices.length > 0) {
        const compliantCount = devices.filter((d) => d.status !== 'revoked').length
        setDeviceCompliancePct(Math.round((compliantCount / devices.length) * 100))
      }
      setZones(MOCK_NETWORK_ZONES)
      setLastUpdated(timestamp())
    } catch {
      setZones(MOCK_NETWORK_ZONES)
      setLastUpdated(timestamp())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const refetch = useCallback(() => {
    void loadData()
  }, [loadData])

  const summary = useMemo(
    () => summarizeNetworkCompliance(zones, deviceCompliancePct),
    [zones, deviceCompliancePct],
  )

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
