/**
 * BrainMint Notifications — Mock Data
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Mock notification records for Employee, Team Lead, and Security roles.
 * Timestamps are computed dynamically relative to "today" so that
 * "Today, HH:MM" labels always display correctly in development.
 *
 * DATA SOURCE: Mock — not connected to any backend endpoint.
 * Replace with real API call when backend /api/notifications is ready.
 */

import type { NotificationItem } from '../types/notification.types';

/** Returns an ISO string for today at the given HH:MM (local time). */
function todayAt(hours: number, minutes: number): string {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/** Returns an ISO string for N days ago at the given HH:MM (local time). */
function daysAgo(days: number, hours: number, minutes: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [

  // ── EMPLOYEE NOTIFICATIONS ──────────────────────────────────────────────────
  {
    id: 'notif-emp-001',
    title: 'Your Snowflake request is being reviewed',
    message: "AR-2048 has been sent to Daniel Brooks. We'll notify you when a decision is made.",
    timestamp: todayAt(9, 18),
    isRead: false,
    priority: 'medium',
    type: 'access',
    targetRoles: ['employee'],
    actionUrl: '/employee/access-requests',
    actionLabel: 'View request',
  },
  {
    id: 'notif-emp-002',
    title: 'Acceptable Use v3.2 needs your acknowledgment',
    message: 'Review the updated policy by 28 Oct to keep your account in good standing.',
    timestamp: todayAt(8, 0),
    isRead: false,
    priority: 'high',
    type: 'policies',
    targetRoles: ['employee'],
    actionUrl: '/employee/access-requests',
    actionLabel: 'Review policy',
  },
  {
    id: 'notif-emp-003',
    title: 'Your GitHub access expires in 6 days',
    message: 'Contributor access to GitHub - Insights ends on 30 Oct. Request a renewal if you still need it.',
    timestamp: todayAt(7, 30),
    isRead: false,
    priority: 'high',
    type: 'access',
    targetRoles: ['employee'],
    actionUrl: '/employee/access-requests/new',
    actionLabel: 'Renew access',
  },
  {
    id: 'notif-emp-004',
    title: 'GitHub access approved',
    message: 'Daniel Brooks approved AR-2047. Your contributor access is now active.',
    timestamp: daysAgo(1, 14, 10),
    isRead: true,
    priority: 'low',
    type: 'access',
    targetRoles: ['employee'],
    actionUrl: '/employee/access-requests',
    actionLabel: 'View request',
  },
  {
    id: 'notif-emp-005',
    title: 'Device compliance verified',
    message: 'MBP-MCHEN-01 passed all 8 security checks. No action is needed.',
    timestamp: daysAgo(1, 9, 30),
    isRead: true,
    priority: 'low',
    type: 'device',
    targetRoles: ['employee'],
    actionUrl: '/employee/my-devices',
    actionLabel: 'View device',
  },

  // ── LEAD NOTIFICATIONS ──────────────────────────────────────────────────────
  {
    id: 'notif-lead-001',
    title: 'Two requests are approaching the review target',
    message: 'Omar Haddad and Aisha Patel have been waiting over 3 hours. Review their access requests soon.',
    timestamp: todayAt(10, 30),
    isRead: false,
    priority: 'high',
    type: 'access',
    targetRoles: ['lead'],
    actionUrl: '/approvals',
    actionLabel: 'Review queue',
  },
  {
    id: 'notif-lead-002',
    title: 'New request from Maya Chen',
    message: 'AR-2048 · Snowflake Analytics · Read-only for 7 days. All automatic policy checks passed.',
    timestamp: todayAt(9, 18),
    isRead: false,
    priority: 'medium',
    type: 'access',
    targetRoles: ['lead'],
    actionUrl: '/approvals',
    actionLabel: 'Review request',
  },
  {
    id: 'notif-lead-003',
    title: 'Noah Williams has a non-compliant device',
    message: 'WIN-NWILLIAMS-01 requires a security update. Resource access is restricted until resolved.',
    timestamp: todayAt(9, 50),
    isRead: false,
    priority: 'high',
    type: 'device',
    targetRoles: ['lead'],
    actionUrl: '/approvals',
    actionLabel: 'View team activity',
  },
  {
    id: 'notif-lead-004',
    title: 'Your decision was applied',
    message: "Elena Rossi's Looker access has been renewed for 90 days. AR-2046 is now approved.",
    timestamp: todayAt(10, 12),
    isRead: true,
    priority: 'low',
    type: 'access',
    targetRoles: ['lead'],
    actionUrl: '/approvals',
    actionLabel: 'View approval history',
  },
  {
    id: 'notif-lead-005',
    title: 'Acceptable Use v3.2 published',
    message: 'Your team has a new policy acknowledgment due 28 Oct. 18 of 24 members have completed it.',
    timestamp: daysAgo(2, 12, 0),
    isRead: true,
    priority: 'medium',
    type: 'policies',
    targetRoles: ['lead'],
    actionUrl: '/approvals',
    actionLabel: 'View policy notice',
  },

  // ── SECURITY NOTIFICATIONS ──────────────────────────────────────────────────
  {
    id: 'notif-sec-001',
    title: 'High-priority alert assigned to you',
    message: 'ALT-0871 · An anomalous sign-in for Lucas Martin was blocked. Review the risk signals and verify the user.',
    timestamp: todayAt(10, 35),
    isRead: false,
    priority: 'critical',
    type: 'security',
    targetRoles: ['security'],
    actionUrl: '/security/profile',
    actionLabel: 'Investigate alert',
  },
  {
    id: 'notif-sec-002',
    title: 'Unmanaged device attempt blocked',
    message: 'ALT-0869 · A public-network device failed trust checks. No protected resource access was granted.',
    timestamp: todayAt(10, 10),
    isRead: false,
    priority: 'high',
    type: 'security',
    targetRoles: ['security'],
    actionUrl: '/security/profile',
    actionLabel: 'View alert',
  },
  {
    id: 'notif-sec-003',
    title: 'Eight devices need compliance remediation',
    message: 'Six devices need security updates and two need encryption enabled. Access restrictions remain enforced.',
    timestamp: todayAt(10, 50),
    isRead: false,
    priority: 'high',
    type: 'device',
    targetRoles: ['security'],
    actionUrl: '/security/profile',
    actionLabel: 'Review devices',
  },
  {
    id: 'notif-sec-004',
    title: 'Acceptable Use rollout is 92% complete',
    message: '228 of 248 employees have acknowledged v3.2. The remaining 20 are due by 28 Oct.',
    timestamp: todayAt(8, 0),
    isRead: true,
    priority: 'medium',
    type: 'policies',
    targetRoles: ['security'],
    actionUrl: '/security/profile',
    actionLabel: 'View policy rollout',
  },
  {
    id: 'notif-sec-005',
    title: 'Scheduled audit export completed',
    message: 'The 23 Oct access and authentication report is ready. The export contains 3,842 verified events.',
    timestamp: todayAt(6, 5),
    isRead: true,
    priority: 'low',
    type: 'system',
    targetRoles: ['security'],
    actionUrl: '/security/profile',
    actionLabel: 'View audit logs',
  },
];
