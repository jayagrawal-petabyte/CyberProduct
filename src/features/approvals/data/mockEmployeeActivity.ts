import type { EmployeeAccessActivityEvent } from '../types/employeeActivity'

// The exact 6 primary events matching Lead Employee Access Activity.png
const primaryEvents: EmployeeAccessActivityEvent[] = [
  {
    id: 'ACT-2026-001',
    timestamp: '2026-10-24T10:28:16Z',
    employeeName: 'Elena Rossi',
    employeeId: 'EMP-1036',
    department: 'Data Platform Engineer',
    event: 'Session started',
    resourceName: 'Looker',
    resourceDescription: 'Enterprise BI',
    status: 'Successful',
    result: 'Allowed',
    ipAddress: '192.168.1.104',
    deviceName: 'MBP-EROSSI-01',
    osInfo: 'macOS 15.6',
    timeText: '10:28 UTC',
    location: 'London, UK (Office Network)',
    details: 'User authenticated via SSO. Looker analytics session established.',
  },
  {
    id: 'ACT-2026-002',
    timestamp: '2026-10-24T10:22:04Z',
    employeeName: 'Maya Chen',
    employeeId: 'EMP-1042',
    department: 'Product Analyst',
    event: 'Session started',
    resourceName: 'Looker',
    resourceDescription: 'Enterprise BI',
    status: 'Successful',
    result: 'Allowed',
    ipAddress: '192.168.1.105',
    deviceName: 'MBP-MCHEN-01',
    osInfo: 'macOS 15.6',
    timeText: '10:22 UTC',
    location: 'London, UK (Office Network)',
    details: 'Active dashboard query session started under ticket AR-2039 permissions.',
  },
  {
    id: 'ACT-2026-003',
    timestamp: '2026-10-24T10:15:30Z',
    employeeName: 'Omar Haddad',
    employeeId: 'EMP-1038',
    department: 'Data Engineer',
    event: 'Session started',
    resourceName: 'Jira · Data Platform',
    resourceDescription: 'Platform board',
    status: 'Successful',
    result: 'Allowed',
    ipAddress: '192.168.1.118',
    deviceName: 'MBP-OHADDAD-01',
    osInfo: 'macOS 15.6',
    timeText: '10:15 UTC',
    location: 'London, UK (Office Network)',
    details: 'Session started with contributor permissions under ticket AR-2040.',
  },
  {
    id: 'ACT-2026-004',
    timestamp: '2026-10-24T09:50:12Z',
    employeeName: 'Noah Williams',
    employeeId: 'EMP-1045',
    department: 'Analytics Engineer',
    event: 'Sign-in blocked',
    resourceName: 'GitHub · Insights',
    resourceDescription: 'Insights core repository',
    status: 'Denied',
    result: 'Blocked',
    ipAddress: '192.168.1.88',
    deviceName: 'WIN-NWILLIAMS-01',
    osInfo: 'Windows 11',
    timeText: '09:50 UTC',
    location: 'London, UK (Office Network)',
    details: 'Sign-in blocked: Device posture requires security patch update. Resource access restricted.',
    flagReason: 'Device compliance enforcement. WIN-NWILLIAMS-01 requires OS security update.',
  },
  {
    id: 'ACT-2026-005',
    timestamp: '2026-10-24T09:36:48Z',
    employeeName: 'Aisha Patel',
    employeeId: 'EMP-1040',
    department: 'UX Researcher',
    event: 'Session started',
    resourceName: 'Figma · Analytics',
    resourceDescription: 'UX design spaces',
    status: 'Successful',
    result: 'Allowed',
    ipAddress: '192.168.1.52',
    deviceName: 'MBP-APATEL-01',
    osInfo: 'macOS 15.6',
    timeText: '09:36 UTC',
    location: 'London, UK (Office Network)',
    details: 'Design collaboration workspace opened via SAML SSO token.',
  },
  {
    id: 'ACT-2026-006',
    timestamp: '2026-10-24T09:12:06Z',
    employeeName: 'Maya Chen',
    employeeId: 'EMP-1042',
    department: 'Product Analyst',
    event: 'Session started',
    resourceName: 'GitHub · Insights',
    resourceDescription: 'Insights core repository',
    status: 'Successful',
    result: 'Allowed',
    ipAddress: '192.168.1.105',
    deviceName: 'MBP-MCHEN-01',
    osInfo: 'macOS 15.6',
    timeText: '09:12 UTC',
    location: 'London, UK (Office Network)',
    details: 'Read access verified and pull request review started.',
  },
]

// Generate remaining events to total 146 events (across 12 resources)
const teamMembers = [
  { name: 'Elena Rossi', id: 'EMP-1036', role: 'Data Platform Engineer', device: 'MBP-EROSSI-01', os: 'macOS 15.6' },
  { name: 'Maya Chen', id: 'EMP-1042', role: 'Product Analyst', device: 'MBP-MCHEN-01', os: 'macOS 15.6' },
  { name: 'Omar Haddad', id: 'EMP-1038', role: 'Data Engineer', device: 'MBP-OHADDAD-01', os: 'macOS 15.6' },
  { name: 'Noah Williams', id: 'EMP-1045', role: 'Analytics Engineer', device: 'WIN-NWILLIAMS-01', os: 'Windows 11' },
  { name: 'Aisha Patel', id: 'EMP-1040', role: 'UX Researcher', device: 'MBP-APATEL-01', os: 'macOS 15.6' },
  { name: 'Sophie Turner', id: 'EMP-1049', role: 'Business Analyst', device: 'MBP-STURNER-01', os: 'macOS 15.6' },
  { name: 'Lucas Martin', id: 'EMP-1044', role: 'Junior Analyst', device: 'MBP-LMARTIN-01', os: 'macOS 15.6' },
]

const resources = [
  { name: 'Looker', desc: 'Enterprise BI' },
  { name: 'Jira · Data Platform', desc: 'Platform board' },
  { name: 'GitHub · Insights', desc: 'Insights core repository' },
  { name: 'Figma · Analytics', desc: 'UX design spaces' },
  { name: 'Snowflake Analytics', desc: 'Curated analytics views' },
  { name: 'AWS · Staging', desc: 'Development & staging infrastructure' },
  { name: 'Production database', desc: 'Customer OLTP database' },
]

const generatedEvents: EmployeeAccessActivityEvent[] = Array.from({ length: 140 }, (_, i) => {
  const member = teamMembers[i % teamMembers.length]
  const res = resources[i % resources.length]
  const isBlocked = i === 12 || i === 45
  const hour = Math.max(0, 8 - Math.floor(i / 20))
  const minute = (59 - (i % 60)).toString().padStart(2, '0')
  const timeStr = `0${hour}:${minute} UTC`

  return {
    id: `ACT-2026-${(i + 7).toString().padStart(3, '0')}`,
    timestamp: `2026-10-24T0${hour}:${minute}:00Z`,
    employeeName: member.name,
    employeeId: member.id,
    department: member.role,
    event: isBlocked ? 'Sign-in blocked' : 'Session started',
    resourceName: res.name,
    resourceDescription: res.desc,
    status: isBlocked ? 'Denied' : 'Successful',
    result: isBlocked ? 'Blocked' : 'Allowed',
    ipAddress: `192.168.1.${100 + (i % 50)}`,
    deviceName: member.device,
    osInfo: member.os,
    timeText: timeStr,
    location: 'London, UK (Office Network)',
    details: isBlocked
      ? 'Sign-in blocked: Security policy check failed.'
      : `Session started for ${res.name}. Access token active.`,
    flagReason: isBlocked ? 'Policy enforcement block' : undefined,
  }
})

export const mockEmployeeActivity: EmployeeAccessActivityEvent[] = [
  ...primaryEvents,
  ...generatedEvents,
]
