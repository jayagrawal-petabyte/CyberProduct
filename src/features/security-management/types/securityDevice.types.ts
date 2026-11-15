/**
 * BrainMint — Security Device Management Types
 * Scope: src/features/security-management/types/securityDevice.types.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * NOTE ON REUSE: platform vocabulary (`DeviceOs`, `DeviceType`) and record
 * conventions are reused from the Admin device module
 * (`src/features/admin/types/device.types.ts`). The record extends the Admin
 * shape with the fields the Security Management screen needs: serial number,
 * employee name display, security posture (with `quarantined`), last-check
 * labels and mock compliance notes.
 *
 * ⚠️ Records are for administrative VISIBILITY and mock review only.
 * Nothing on this screen quarantines devices, remediates endpoints, runs
 * assessments or talks to an MDM — those belong to the backend/MDM engine.
 * No device credentials, tokens or secrets are stored by design.
 */

// Re-used platform vocabulary from the Admin device module:
export type {
  DeviceOs,
  DeviceType,
} from '../../admin/types/device.types'

export { DEVICE_COMPLIANCE_LABELS } from '../../admin/types/device.types'

import type { DeviceOs, DeviceType } from '../../admin/types/device.types'

/** Endpoint security posture shown in the inventory (green/amber/red). */
export type DevicePosture =
  | 'compliant'     // green
  | 'non-compliant' // amber
  | 'quarantined'   // red

/**
 * A single enrolled endpoint in the security inventory.
 */
export interface SecurityDeviceRecord {
  /** Internal record id. */
  id: string
  /** Business-facing device identifier, e.g. "BM-DEV-1042". */
  deviceId: string
  /** Human-friendly device name. */
  deviceName: string
  /** Hardware serial number. */
  serialNumber: string
  /** Assigned employee display name. */
  assignedName: string
  /** Assigned employee email (matches the Admin users vocabulary). */
  assignedEmail: string
  /** Platform of the device. */
  os: DeviceOs
  /** OS build/version label, e.g. "Windows 11 Pro 23H2". */
  osVersion: string
  /** Hardware form factor. */
  deviceType: DeviceType
  /** Hardware manufacturer, e.g. "Dell". */
  manufacturer: string
  /** Current security posture. */
  posture: DevicePosture
  /** Endpoint security agent status label, e.g. "EDR Agent v4.2.1 — Active". */
  securityAgent: string
  /** Human-friendly last posture-check label, e.g. "12 minutes ago". */
  lastCheck: string
  /** Human-friendly enrollment/registration date, e.g. "Jun 04, 2023". */
  registeredOn: string
  /** Mock compliance issue; present for non-compliant/quarantined records. */
  complianceNote?: string
}

/** Filter state: search (name/ID/serial/owner) + platform + posture tab. */
export interface SecurityDeviceFiltersState {
  search: string
  os: string
  posture: string
}

/** Default (empty) filter state. */
export const DEFAULT_SECURITY_DEVICE_FILTERS: SecurityDeviceFiltersState = {
  search: '',
  os: 'all',
  posture: 'all',
}

/** Display labels for security postures. */
export const DEVICE_POSTURE_LABELS: Record<DevicePosture, string> = {
  compliant: 'Compliant',
  'non-compliant': 'Non-Compliant',
  quarantined: 'Quarantined',
}

/**
 * Derived inventory metrics — computed from the dataset, never hardcoded:
 *  - Managed devices: total record count
 *  - Compliant / Non-compliant / Quarantined: posture counts
 */
export interface SecurityDeviceSummary {
  total: number
  compliant: number
  nonCompliant: number
  quarantined: number
}
