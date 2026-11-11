/**
 * BrainMint Admin — Device Management Types
 * Scope: src/features/admin/types/device.types.ts
 */

/** Operating system platforms tracked for enrolled endpoints. */
export type DeviceOs = 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS'

/** Hardware form factor of the enrolled device. */
export type DeviceType = 'Laptop' | 'Desktop' | 'Mobile' | 'Tablet'

/** Endpoint compliance posture shown in the inventory. */
export type DeviceComplianceStatus = 'compliant' | 'non-compliant' | 'pending'

/**
 * A single enrolled device in the admin inventory.
 *
 * ⚠️ Intentionally excludes credentials, tokens, certificates, or any
 * device secrets — this record is for administrative *visibility* only.
 */
export interface AdminDeviceRecord {
  /** Internal record id. */
  id: string
  /** Business-facing device identifier, e.g. "BM-DEV-1042". */
  deviceId: string
  /** Human-friendly device name. */
  deviceName: string
  /** Email of the employee the device is assigned to (links users dataset). */
  assignedEmail: string
  /** Platform of the device. */
  os: DeviceOs
  /** OS build/version label, e.g. "Windows 11 Pro 23H2". */
  osVersion: string
  /** Hardware form factor. */
  deviceType: DeviceType
  /** Current endpoint compliance posture. */
  compliance: DeviceComplianceStatus
  /** Human-friendly "last seen" label, e.g. "24 minutes ago". */
  lastSeen: string
  /** Human-friendly enrollment/registration date, e.g. "Jun 04, 2023". */
  registeredOn: string
  /** Hardware manufacturer, e.g. "Dell". */
  manufacturer: string
  /** Endpoint security agent status label, e.g. "EDR Agent v4.2.1 — Active". */
  securityAgent: string
}

/** Aggregated inventory metrics (derived from the dataset, never hardcoded). */
export interface DeviceSummaryMetrics {
  total: number
  compliant: number
  nonCompliant: number
  pending: number
}

/** Client-side filter state for the device inventory. */
export interface DeviceFiltersState {
  /** Matches device name or device ID (case-insensitive). */
  search: string
  /** Assigned employee email or 'all'. */
  employee: string
  /** Operating system platform or 'all'. */
  os: string
  /** Device type or 'all'. */
  deviceType: string
  /** Compliance status or 'all'. */
  compliance: string
}

/** Default (empty) filter state. */
export const DEFAULT_DEVICE_FILTERS: DeviceFiltersState = {
  search: '',
  employee: 'all',
  os: 'all',
  deviceType: 'all',
  compliance: 'all',
}

/** Display labels for compliance statuses. */
export const DEVICE_COMPLIANCE_LABELS: Record<DeviceComplianceStatus, string> = {
  compliant: 'Compliant',
  'non-compliant': 'Non-Compliant',
  pending: 'Pending Verification',
}
