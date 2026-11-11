import { mockApprovalRequests } from '../../approvals/data/mockApprovalRequests'
import type { DashboardData } from '../types/dashboard'

export async function getDashboardData(): Promise<DashboardData> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))

  return {
    summary: {
      pendingCount: '05',
      pendingSlaText: '2 requests nearing review SLA',
      approvedWeekCount: 18,
      approvedWeekDiff: '+4 compared with last week',
      avgReviewTime: '2.4h',
      avgReviewTarget: 'Target: under 4 business hours',
      teamMembersCount: 24,
      teamName: 'Data & Insights',
      pendingApprovalsCount: 5,
      approvedRequestsCount: 18,
      rejectedRequestsCount: 2,
      reviewSlaHours: 4,
    },
    priorityRequests: mockApprovalRequests.slice(0, 3),
    requestVolume: [
      { day: '18 Oct', approved: 28, submitted: 20 },
      { day: '19 Oct', approved: 45, submitted: 32 },
      { day: '20 Oct', approved: 35, submitted: 25 },
      { day: '21 Oct', approved: 72, submitted: 54 },
      { day: '22 Oct', approved: 50, submitted: 42 },
      { day: '23 Oct', approved: 85, submitted: 60 },
      { day: '24 Oct', approved: 65, submitted: 48 },
    ],
    latestDecision: {
      title: 'GitHub · Insights approved for Maya Chen',
      subtitle: 'AR-2047 · Contributor · 7 days · Access active',
      time: '23 Oct, 14:10 UTC',
    },
    teamActivity: [
      {
        id: 'ACT-01',
        title: 'Access renewed for Elena Rossi',
        description: 'Looker viewer access · 90 days',
        time: '10:12 UTC',
        icon: 'key',
      },
      {
        id: 'ACT-02',
        title: "Noah's device is non-compliant",
        description: 'Access restricted until updates complete.',
        time: '09:50 UTC',
        icon: 'monitor',
      },
    ],
  }
}
