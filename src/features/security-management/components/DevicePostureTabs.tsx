/**
 * BrainMint — Device Posture Tabs
 * Scope: src/features/security-management/components/DevicePostureTabs.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Posture filter tabs rendered above the endpoint inventory, with counts
 * derived from the dataset (never hardcoded). Acts as the posture facet of
 * the combined filter state, replacing a posture dropdown.
 */

import React from 'react'
import type { DevicePosture } from '../types/securityDevice.types'
import { DEVICE_POSTURE_LABELS } from '../types/securityDevice.types'
import './SecurityDevicesTable.css'

interface DevicePostureTabsProps {
  /** Currently selected tab value ('all' or a DevicePosture). */
  value: string
  onChange: (next: string) => void
  /** Counts per posture, derived from the full dataset. */
  counts: Record<DevicePosture, number>
  totalDevices: number
  /** Hides the counts while the mock dataset is loading. */
  isLoading: boolean
}

export const DevicePostureTabs: React.FC<DevicePostureTabsProps> = ({
  value,
  onChange,
  counts,
  totalDevices,
  isLoading,
}) => {
  return (
    <div className="secdev-tabs" role="tablist" aria-label="Filter inventory by security posture">
      <button
        type="button"
        role="tab"
        aria-selected={value === 'all'}
        className={`secdev-tab${value === 'all' ? ' secdev-tab--current' : ''}`}
        onClick={() => onChange('all')}
      >
        All devices
        <span className="secdev-tab__count">{isLoading ? '–' : totalDevices}</span>
      </button>
      {(['compliant', 'non-compliant', 'quarantined'] as DevicePosture[]).map((posture) => (
        <button
          key={posture}
          type="button"
          role="tab"
          aria-selected={value === posture}
          className={`secdev-tab${value === posture ? ' secdev-tab--current' : ''}`}
          onClick={() => onChange(posture)}
        >
          {DEVICE_POSTURE_LABELS[posture]}
          <span className="secdev-tab__count">{isLoading ? '–' : counts[posture]}</span>
        </button>
      ))}
    </div>
  )
}

export default DevicePostureTabs
