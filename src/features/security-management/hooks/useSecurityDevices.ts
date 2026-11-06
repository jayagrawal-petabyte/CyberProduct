/**
 * BrainMint — Security Device Management Data Hook
 * Scope: src/features/security-management/hooks/useSecurityDevices.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * ⚠️ DEVELOPMENT MOCK DATA — serves the mock device inventory with a
 * simulated latency window so loading states can be exercised. This is not
 * a live MDM connection and performs NO scanning, quarantine, remediation,
 * or endpoint enforcement of any kind.
 *
 * "Sync inventory" is a local prototype affordance only — it re-serves the
 * same static mock snapshot and never claims a real MDM sync occurred.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  SecurityDeviceFiltersState,
  SecurityDeviceRecord,
  SecurityDeviceSummary,
} from '../types/securityDevice.types'
import { MOCK_SECURITY_DEVICES } from '../data/mockSecurityDevices'

export interface UseSecurityDevicesResult {
  devices: SecurityDeviceRecord[]
  summary: SecurityDeviceSummary
  isLoading: boolean
  /** Dev-only indicator string; the dataset is a mock snapshot, not an MDM feed. */
  lastUpdated: string
  refetch: () => void
}

/**
 * Reusable client-side filtering. Search matches device name, device ID,
 * serial number, employee name or employee email; the platform filter and
 * posture tab combine with AND semantics.
 */
export function filterSecurityDevices(
  devices: SecurityDeviceRecord[],
  filters: SecurityDeviceFiltersState,
): SecurityDeviceRecord[] {
  const q = filters.search.trim().toLowerCase()
  return devices.filter((device) => {
    const matchesSearch =
      !q ||
      device.deviceName.toLowerCase().includes(q) ||
      device.deviceId.toLowerCase().includes(q) ||
      device.serialNumber.toLowerCase().includes(q) ||
      device.assignedName.toLowerCase().includes(q) ||
      device.assignedEmail.toLowerCase().includes(q)
    const matchesOs = filters.os === 'all' || device.os === filters.os
    const matchesPosture = filters.posture === 'all' || device.posture === filters.posture
    return matchesSearch && matchesOs && matchesPosture
  })
}

/**
 * Derives the summary-card metrics from the dataset — never hardcoded:
 *  - Managed devices: total record count
 *  - Compliant / Non-compliant / Quarantined: posture counts
 */
export function summarizeSecurityDevices(
  devices: SecurityDeviceRecord[],
): SecurityDeviceSummary {
  let compliant = 0
  let nonCompliant = 0
  let quarantined = 0
  for (const device of devices) {
    if (device.posture === 'compliant') compliant += 1
    else if (device.posture === 'non-compliant') nonCompliant += 1
    else quarantined += 1
  }
  return { total: devices.length, compliant, nonCompliant, quarantined }
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

export function useSecurityDevices(): UseSecurityDevicesResult {
  const [devices, setDevices] = useState<SecurityDeviceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('—')

  // Simulated initial fetch of the mock dataset.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDevices(MOCK_SECURITY_DEVICES)
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    window.setTimeout(() => {
      // Mock "refresh": re-serve the same static snapshot with a new stamp.
      setDevices([...MOCK_SECURITY_DEVICES])
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 350)
  }, [])

  const summary = useMemo(() => summarizeSecurityDevices(devices), [devices])

  return { devices, summary, isLoading, lastUpdated, refetch }
}
