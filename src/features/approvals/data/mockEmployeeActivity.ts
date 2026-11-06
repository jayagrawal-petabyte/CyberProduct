import type { EmployeeAccessActivityEvent } from '../types/employeeActivity'

// The exact 6 events matching the reference screenshot
const primaryEvents: EmployeeAccessActivityEvent[] = [
  {
    id: 'ACT-2026-001',
    timestamp: '2026-10-24T10:42:00Z',
    employeeName: 'Jordan Ellis',
    department: 'Engineering',
    event: 'Access granted',
    resourceName: 'GitHub',
    resourceDescription: 'Engineering organization',
    status: 'Successful',
    ipAddress: '192.168.1.104',
    deviceName: 'MacBookPro-JELLIS-01',
    location: 'London, UK (Office Network)',
    details: 'User authenticated via SSO with biometric key. Repository read/write token issued.',
  },
  {
    id: 'ACT-2026-002',
    timestamp: '2026-10-24T10:36:00Z',
    employeeName: 'Maya Chen',
    department: 'Data & Analytics',
    event: 'Unusual login detected',
    resourceName: 'AWS Console',
    resourceDescription: 'Development environment',
    status: 'Flagged',
    ipAddress: '198.51.100.44',
    deviceName: 'Unknown-Android-14',
    location: 'Frankfurt, DE (Public IP)',
    details: 'Login from unrecognized hardware fingerprint and foreign IP address during off-hours.',
    flagReason: 'New device detected. Verify this activity with the employee.',
  },
  {
    id: 'ACT-2026-003',
    timestamp: '2026-10-24T10:28:00Z',
    employeeName: 'Noah Bennett',
    department: 'Platform Engineering',
    event: 'Access denied',
    resourceName: 'AWS Console',
    resourceDescription: 'Production environment',
    status: 'Denied',
    ipAddress: '192.168.1.118',
    deviceName: 'DellXPS-NBENNETT-02',
    location: 'London, UK (Office Network)',
    details: 'Requested role requires Security Lead dual-authorization. Access policy rule SEC-PROD-09 blocked access.',
    flagReason: 'Privileged role access denied without active approval.',
  },
  {
    id: 'ACT-2026-004',
    timestamp: '2026-10-24T10:15:00Z',
    employeeName: 'Sofia Reed',
    department: 'Technical Writing',
    event: 'Access request submitted',
    resourceName: 'Jira',
    resourceDescription: 'Platform project',
    status: 'Pending',
    ipAddress: '192.168.1.88',
    deviceName: 'MacBookAir-SREED-01',
    location: 'London, UK (Office Network)',
    details: 'Submitted request REQ-1045 for Project admin role. Awaiting manager review.',
  },
  {
    id: 'ACT-2026-005',
    timestamp: '2026-10-24T09:54:00Z',
    employeeName: 'Ethan Brooks',
    department: 'DevOps',
    event: 'Permission updated',
    resourceName: 'Confluence',
    resourceDescription: 'Engineering space',
    status: 'Updated',
    ipAddress: '192.168.1.52',
    deviceName: 'ThinkPad-EBROOKS-01',
    location: 'London, UK (Office Network)',
    details: 'Space permissions updated from Viewer to Editor following ticket ACP-2026-1044 approval.',
  },
  {
    id: 'ACT-2026-006',
    timestamp: '2026-10-24T09:41:00Z',
    employeeName: 'Riley Hayes',
    department: 'Infrastructure',
    event: 'Access granted',
    resourceName: 'GitHub',
    resourceDescription: 'Infrastructure repository',
    status: 'Successful',
    ipAddress: '192.168.1.66',
    deviceName: 'MacBookPro-RHAYES-01',
    location: 'London, UK (Office Network)',
    details: 'SSH key deployed to CI/CD repository with standard developer permissions.',
  },
]

// Generate remaining events to total 248 events (186 granted, 12 denied, 5 alerts/flagged, rest updated/pending)
const teamMembers = [
  'Jordan Ellis',
  'Maya Chen',
  'Noah Bennett',
  'Sofia Reed',
  'Ethan Brooks',
  'Riley Hayes',
  'Liam Parker',
  'Avery Collins',
  'Maya Patel',
  'Daniel Brooks',
  'Aisha Rahman',
  'Leo Martinez',
]

const resources = [
  { name: 'GitHub', desc: 'Engineering organization' },
  { name: 'AWS Console', desc: 'Development environment' },
  { name: 'Jira', desc: 'Platform project' },
  { name: 'Confluence', desc: 'Engineering space' },
  { name: 'Snowflake', desc: 'Data Analytics Warehouse' },
  { name: 'Datadog', desc: 'Monitoring & APM' },
]

const generatedEvents: EmployeeAccessActivityEvent[] = []

for (let i = 7; i <= 248; i++) {
  const member = teamMembers[(i * 3) % teamMembers.length]
  const res = resources[(i * 5) % resources.length]
  let status: EmployeeAccessActivityEvent['status'] = 'Successful'
  let eventType: EmployeeAccessActivityEvent['event'] = 'Access granted'

  if (i === 15 || i === 42 || i === 99) {
    status = 'Flagged'
    eventType = 'Unusual login detected'
  } else if (i % 20 === 0 && generatedEvents.filter((e) => e.status === 'Denied').length < 10) {
    status = 'Denied'
    eventType = 'Access denied'
  } else if (i % 12 === 0) {
    status = 'Updated'
    eventType = 'Permission updated'
  } else if (i % 15 === 0) {
    status = 'Pending'
    eventType = 'Access request submitted'
  }

  const hour = Math.max(0, 9 - Math.floor(i / 30))
  const min = (60 - (i % 60)) % 60
  const timeStr = `2026-10-24T0${hour}:${min < 10 ? '0' : ''}${min}:00Z`

  generatedEvents.push({
    id: `ACT-2026-${i < 100 ? (i < 10 ? '00' : '0') : ''}${i}`,
    timestamp: timeStr,
    employeeName: member,
    department: 'Engineering',
    event: eventType,
    resourceName: res.name,
    resourceDescription: res.desc,
    status,
    ipAddress: `192.168.1.${100 + (i % 150)}`,
    deviceName: `DEV-DEVICE-${(i % 12) + 1}`,
    location: 'London, UK (Office Network)',
    details: `Standard access verification completed for ${member} accessing ${res.name}.`,
  })
}

export const mockEmployeeActivity: EmployeeAccessActivityEvent[] = [
  ...primaryEvents,
  ...generatedEvents,
]

