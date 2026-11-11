/**
 * BrainMint — Security Device Management Mock Data
 * Scope: src/features/security-management/data/mockSecurityDevices.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * ⚠️ DEVELOPMENT MOCK DATA — this dataset is a fictional snapshot that
 * exists purely to exercise the UI while MDM integration is pending. It
 * does not represent a live endpoint inventory, and no device scanning,
 * quarantine, or remediation is performed anywhere.
 *
 * Self-consistency note: posture counts are the single source for the
 * summary cards (Managed devices / Compliant / Non-compliant / Quarantined)
 * — see hooks/useSecurityDevices.ts → summarizeSecurityDevices().
 * The inventory reconciles exactly: 312 devices = 302 compliant +
 * 8 non-compliant + 2 quarantined.
 */

import type { DeviceOs, DeviceType } from '../../admin/types/device.types'
import type { DevicePosture, SecurityDeviceRecord } from '../types/securityDevice.types'

/** Dev snapshot label (same convention as the other module screens). */
export const INVENTORY_SNAPSHOT_DATE = '24 Oct 2026'

/** Assigned employees (fictional; emails match the BrainMint domain). */
const EMPLOYEES: ReadonlyArray<{ name: string; email: string }> = [
  { name: 'Ishaan Gupta', email: 'ishaan.gupta@brainmint.io' },
  { name: 'Aarushi Mehta', email: 'aarushi.mehta@brainmint.io' },
  { name: 'Shivam Kumar', email: 'shivam.kumar@brainmint.io' },
  { name: 'Priya Sharma', email: 'priya.sharma@brainmint.io' },
  { name: 'Rohan Verma', email: 'rohan.verma@brainmint.io' },
  { name: 'Neha Kulkarni', email: 'neha.kulkarni@brainmint.io' },
  { name: 'Arjun Nair', email: 'arjun.nair@brainmint.io' },
  { name: 'Divya Iyer', email: 'divya.iyer@brainmint.io' },
  { name: 'Karan Malhotra', email: 'karan.malhotra@brainmint.io' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@brainmint.io' },
  { name: 'Vikram Singh', email: 'vikram.singh@brainmint.io' },
  { name: 'Ananya Bose', email: 'ananya.bose@brainmint.io' },
  { name: 'Farhan Qureshi', email: 'farhan.qureshi@brainmint.io' },
  { name: 'Riya Menon', email: 'riya.menon@brainmint.io' },
  { name: 'Aditya Joshi', email: 'aditya.joshi@brainmint.io' },
  { name: 'Meera Pillai', email: 'meera.pillai@brainmint.io' },
]

/** Per-platform hardware/os asset pools (fictional inventory assets). */
interface PlatformAssets {
  models: ReadonlyArray<{ name: string; type: DeviceType; maker: string }>
  osVersions: ReadonlyArray<string>
  serialPrefix: string
  nameTag: string
}

const PLATFORM_ASSETS: Record<DeviceOs, PlatformAssets> = {
  Windows: {
    models: [
      { name: 'Dell Latitude 7440', type: 'Laptop', maker: 'Dell' },
      { name: 'HP EliteBook 840', type: 'Laptop', maker: 'HP' },
      { name: 'Lenovo ThinkPad X1', type: 'Laptop', maker: 'Lenovo' },
      { name: 'Dell OptiPlex 7010', type: 'Desktop', maker: 'Dell' },
    ],
    osVersions: ['Windows 11 Pro 23H2', 'Windows 11 Pro 22H2', 'Windows 10 Pro 22H2'],
    serialPrefix: '5CD9',
    nameTag: 'WIN',
  },
  macOS: {
    models: [
      { name: 'MacBook Pro 14', type: 'Laptop', maker: 'Apple' },
      { name: 'MacBook Air 13', type: 'Laptop', maker: 'Apple' },
      { name: 'Mac Mini M2', type: 'Desktop', maker: 'Apple' },
    ],
    osVersions: ['macOS Sonoma 14.6', 'macOS Sonoma 14.1', 'macOS Ventura 13.6'],
    serialPrefix: 'C02X',
    nameTag: 'MAC',
  },
  Linux: {
    models: [
      { name: 'Framework Laptop 13', type: 'Laptop', maker: 'Framework' },
      { name: 'ThinkPad T14 gen Linux', type: 'Laptop', maker: 'Lenovo' },
      { name: 'Custom Engineering Desktop', type: 'Desktop', maker: 'In-house' },
    ],
    osVersions: ['Ubuntu 24.04 LTS', 'Fedora 40', 'Ubuntu 22.04 LTS'],
    serialPrefix: 'LNX1',
    nameTag: 'LNX',
  },
  iOS: {
    models: [
      { name: 'iPhone 15 Pro', type: 'Mobile', maker: 'Apple' },
      { name: 'iPhone 14', type: 'Mobile', maker: 'Apple' },
      { name: 'iPad Pro 11', type: 'Tablet', maker: 'Apple' },
    ],
    osVersions: ['iOS 18.2', 'iOS 18.0', 'iPadOS 17.6'],
    serialPrefix: 'F17F',
    nameTag: 'IOS',
  },
  Android: {
    models: [
      { name: 'Galaxy S24', type: 'Mobile', maker: 'Samsung' },
      { name: 'Pixel 8', type: 'Mobile', maker: 'Google' },
      { name: 'Galaxy Tab S9', type: 'Tablet', maker: 'Samsung' },
    ],
    osVersions: ['Android 14', 'Android 14 (One UI 6.1)', 'Android 13'],
    serialPrefix: 'R58T',
    nameTag: 'AND',
  },
}

/** Deterministic per-platform name counters (avoids duplicate names). */
const nameCounters: Record<DeviceOs, number> = { Windows: 0, macOS: 0, Linux: 0, iOS: 0, Android: 0 }

/** Deterministic posture-check freshness labels (rotated by index). */
const LAST_CHECK_POOL: ReadonlyArray<string> = [
  '6 minutes ago',
  '18 minutes ago',
  '24 minutes ago',
  '41 minutes ago',
  '1 hr ago',
  '2 hrs ago',
  '5 hrs ago',
  'Yesterday',
]

/** Deterministic enrollment-date labels (rotated by index). */
const REGISTERED_POOL: ReadonlyArray<string> = [
  'Mar 14, 2023', 'Jun 02, 2023', 'Sep 21, 2023', 'Jan 09, 2024',
  'Apr 18, 2024', 'Jul 26, 2024', 'Feb 11, 2025', 'May 30, 2025',
]

const EDR_ACTIVE = 'EDR Agent v4.2.1 — Active'
const EDR_OUTDATED = 'EDR Agent v3.9.4 — Update required'

/** Builds one record; `over` overrides any field (used for hero records). */
function makeDevice(os: DeviceOs, index: number, over: Partial<SecurityDeviceRecord>): SecurityDeviceRecord {
  const assets = PLATFORM_ASSETS[os]
  const employee = EMPLOYEES[index % EMPLOYEES.length]
  const model = assets.models[index % assets.models.length]
  nameCounters[os] += 1
  const serial = `${assets.serialPrefix}${String(1000000 + ((index * 911) % 899999)).slice(1)}`
  return {
    id: `sd-${index + 1}`,
    deviceId: `BM-DEV-${1070 + index}`,
    deviceName: `${model.name} (${assets.nameTag}-${String(nameCounters[os]).padStart(3, '0')})`,
    serialNumber: serial,
    assignedName: employee.name,
    assignedEmail: employee.email,
    os,
    osVersion: assets.osVersions[index % assets.osVersions.length],
    deviceType: model.type,
    manufacturer: model.maker,
    posture: 'compliant',
    securityAgent: EDR_ACTIVE,
    lastCheck: LAST_CHECK_POOL[index % LAST_CHECK_POOL.length],
    registeredOn: REGISTERED_POOL[index % REGISTERED_POOL.length],
    ...over,
  }
}

/**
 * Hero records — the two quarantined and eight non-compliant devices, posed
 * at the front of the inventory (with two compliant records interleaved) so
 * page 1 of the table demonstrates every posture.
 */
const HERO_RECORDS: ReadonlyArray<SecurityDeviceRecord> = [
  makeDevice('Windows', 0, {
    id: 'sd-hero-1',
    deviceId: 'BM-DEV-1003',
    deviceName: 'Dell Latitude 7440 (WIN-001)',
    posture: 'quarantined',
    securityAgent: EDR_OUTDATED,
    lastCheck: '41 minutes ago',
    complianceNote: 'EDR agent unreachable for 3+ days — device kept off trusted networks pending review.',
  }),
  makeDevice('macOS', 1, {
    id: 'sd-hero-2',
    deviceId: 'BM-DEV-1007',
    deviceName: "MacBook Pro 14 (MAC-001)",
    posture: 'non-compliant',
    osVersion: 'macOS Sonoma 14.1',
    complianceNote: 'FileVault disk encryption is turned off — requires provisioning profile update.',
  }),
  makeDevice('Windows', 2, {
    id: 'sd-hero-3',
    deviceId: 'BM-DEV-1012',
    deviceName: 'HP EliteBook 840 (WIN-002)',
    posture: 'non-compliant',
    securityAgent: EDR_OUTDATED,
    complianceNote: 'EDR agent v3.9.4 is past the supported window — upgrade to v4.2.x.',
  }),
  makeDevice('macOS', 3, {
    id: 'sd-hero-4',
    deviceId: 'BM-DEV-1019',
    deviceName: "Ishaan's MacBook Pro 14 (MAC-002)",
    assignedName: 'Ishaan Gupta',
    assignedEmail: 'ishaan.gupta@brainmint.io',
    osVersion: 'macOS Sonoma 14.6',
  }),
  makeDevice('iOS', 4, {
    id: 'sd-hero-5',
    deviceId: 'BM-DEV-1023',
    deviceName: 'iPhone 15 Pro (IOS-001)',
    osVersion: 'iOS 18.2',
    assignedName: 'Ishaan Gupta',
    assignedEmail: 'ishaan.gupta@brainmint.io',
    posture: 'non-compliant',
    complianceNote: 'Device passcode not set within the required window — compliance re-check required.',
  }),
  makeDevice('Android', 5, {
    id: 'sd-hero-6',
    deviceId: 'BM-DEV-1031',
    deviceName: 'Galaxy Tab S9 (AND-001)',
    posture: 'quarantined',
    osVersion: 'Android 13',
    complianceNote: 'Root detected — device network access restricted pending reinstatement review.',
  }),
  makeDevice('Linux', 6, {
    id: 'sd-hero-7',
    deviceId: 'BM-DEV-1037',
    deviceName: 'Custom Engineering Desktop (LNX-001)',
    posture: 'non-compliant',
    osVersion: 'Fedora 40',
    complianceNote: 'Mandatory disk-encryption profile absent — LUKS enrollment pending.',
  }),
  makeDevice('Windows', 7, {
    id: 'sd-hero-8',
    deviceId: 'BM-DEV-1042',
    deviceName: 'Lenovo ThinkPad X1 (WIN-003)',
    posture: 'non-compliant',
    complianceNote: 'Screen lock policy not enforced — password/PIN requirement missing.',
  }),
  makeDevice('macOS', 8, {
    id: 'sd-hero-9',
    deviceId: 'BM-DEV-1048',
    deviceName: 'Mac Mini M2 (MAC-003)',
    posture: 'non-compliant',
    complianceNote: 'Firewall disabled — requires firewall profile reapplication.',
  }),
  makeDevice('iOS', 9, {
    id: 'sd-hero-10',
    deviceId: 'BM-DEV-1053',
    deviceName: 'iPhone 14 (IOS-002)',
    osVersion: 'iOS 18.0',
    posture: 'non-compliant',
    complianceNote: 'OS version below the required minimum — update to iOS 18.2.',
  }),
  makeDevice('Android', 10, {
    id: 'sd-hero-11',
    deviceId: 'BM-DEV-1059',
    deviceName: 'Pixel 8 (AND-002)',
    posture: 'non-compliant',
    osVersion: 'Android 13',
    complianceNote: 'Work profile not enrolled — managed configuration missing.',
  }),
  makeDevice('Linux', 11, {
    id: 'sd-hero-12',
    deviceId: 'BM-DEV-1064',
    deviceName: "Aarushi's Framework Laptop 13 (LNX-002)",
    assignedName: 'Aarushi Mehta',
    assignedEmail: 'aarushi.mehta@brainmint.io',
    osVersion: 'Ubuntu 24.04 LTS',
  }),
]

/**
 * Platform cycle for the procedural 300 compliant records — mirrors the
 * Windows 45% / macOS 25% / Linux 8% / iOS 11% / Android 11% fleet mix.
 */
const PLATFORM_CYCLE = (() => {
  const cycle: DeviceOs[] = []
  const push = (os: DeviceOs, count: number) => { for (let i = 0; i < count; i += 1) cycle.push(os) }
  push('Windows', 45)
  push('macOS', 25)
  push('iOS', 11)
  push('Android', 11)
  push('Linux', 8)
  return cycle
})() // length 100 — repeats cleanly for 300 records

/**
 * The full 312-device mock inventory.
 * 312 = 2 quarantined + 8 non-compliant + 302 compliant.
 */
export const MOCK_SECURITY_DEVICES: SecurityDeviceRecord[] = [
  ...HERO_RECORDS,
  ...Array.from({ length: 300 }, (_, i) =>
    makeDevice(PLATFORM_CYCLE[i % 100], i + 12, {}),
  ),
]

/** Platform filter option values (all five platforms the fleet supports). */
export const SECURITY_DEVICE_OS_OPTIONS: DeviceOs[] = ['Windows', 'macOS', 'Linux', 'iOS', 'Android']

/** Posture tab option values. */
export const DEVICE_POSTURE_OPTIONS: DevicePosture[] = [
  'compliant',
  'non-compliant',
  'quarantined',
]
