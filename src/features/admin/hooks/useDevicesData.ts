import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  AdminDeviceRecord,
  DeviceFiltersState,
  DeviceSummaryMetrics,
  DEFAULT_DEVICE_FILTERS,
} from '../types/device.types'
import { MOCK_DEVICE_INVENTORY } from './mockDevicesData'

export interface UseDevicesDataResult {
  devices: AdminDeviceRecord[]
  summary: DeviceSummaryMetrics
  isLoading: boolean
  /** Dev-only indicator label; the dataset is mock data, not an MDM feed. */
  lastUpdated: string
  refetch: () => void
}

/**
 * Reusable client-side filtering for the device inventory.
 * Search matches device name or device ID; the assigned-employee,
 * OS, device-type and compliance filters combine with AND semantics.
 * `employee` is matched against the assigned employee's email.
 */
export function filterDevices(
  devices: AdminDeviceRecord[],
  filters: DeviceFiltersState,
): AdminDeviceRecord[] {
  const q = filters.search.trim().toLowerCase()
  return devices.filter((device) => {
    const matchesSearch =
      !q ||
      device.deviceName.toLowerCase().includes(q) ||
      device.deviceId.toLowerCase().includes(q)
    const matchesEmployee =
      filters.employee === 'all' || device.assignedEmail === filters.employee
    const matchesOs = filters.os === 'all' || device.os === filters.os
    const matchesType = filters.deviceType === 'all' || device.deviceType === filters.deviceType
    const matchesCompliance =
      filters.compliance === 'all' || device.compliance === filters.compliance
    return matchesSearch && matchesEmployee && matchesOs && matchesType && matchesCompliance
  })
}

/** Derives inventory metrics from the dataset — never hardcoded. */
export function summarizeDevices(devices: AdminDeviceRecord[]): DeviceSummaryMetrics {
  let compliant = 0
  let nonCompliant = 0
  let pending = 0
  for (const d of devices) {
    if (d.compliance === 'compliant') compliant += 1
    else if (d.compliance === 'non-compliant') nonCompliant += 1
    else pending += 1
  }
  return { total: devices.length, compliant, nonCompliant, pending }
}

function timestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
}

/**
 * State hook for the BrainMint admin Device Management page.
 *
 * ⚠️ DEVELOPMENT MOCK DATA — serves the mock device inventory with a
 * simulated latency window so loading states can be exercised. This is
 * not a live MDM/backend connection and performs no device scanning
 * or enforcement.
 */
export function useDevicesData(): UseDevicesDataResult {
  const [devices, setDevices] = useState<AdminDeviceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('—')

  // Simulated initial fetch of the mock dataset.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDevices(MOCK_DEVICE_INVENTORY)
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    window.setTimeout(() => {
      // Mock "refresh": re-serve the same dataset with a new timestamp.
      setDevices([...MOCK_DEVICE_INVENTORY])
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 350)
  }, [])

  const summary = useMemo(() => summarizeDevices(devices), [devices])

  return { devices, summary, isLoading, lastUpdated, refetch }
}

export { DEFAULT_DEVICE_FILTERS }
