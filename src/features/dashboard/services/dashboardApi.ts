import { mockApprovalRequests } from '../../approvals/data/mockApprovalRequests'
import type { ApprovalRequest } from '../../approvals/types/approvalRequest'
import type { DashboardData, RecentActivityItem } from '../types/dashboard'

/**
 * Development mock activity records matching the Team Lead Dashboard design.
 * In production, these should be supplied by an audit/activity logging service.
 */
const mockRecentActivity: RecentActivityItem[] = [
  {
    id: 'ACT-101',
    type: 'request_submitted',
    title: 'Access request submitted',
    description: 'Jordan Ellis requested GitHub write access.',
    time: '08:42',
    timestamp: '2026-10-24T08:42:00Z',
  },
  {
    id: 'ACT-102',
    type: 'request_approved',
    title: 'Request approved',
    description: "Alex Morgan approved Liam Parker's Jira access.",
    time: '08:20',
    timestamp: '2026-10-24T08:20:00Z',
  },
  {
    id: 'ACT-103',
    type: 'compliance_alert',
    title: 'Device compliance alert',
    description: "Maya Chen's laptop requires a security update.",
    time: '08:05',
    timestamp: '2026-10-24T08:05:00Z',
  },
]

export const dashboardDataSource = 'development mock data'

/**
 * Service boundary for the Team Lead Dashboard.
 * Fetches dashboard aggregates, pending requests awaiting review,
 * security compliance metrics, and recent team activity.
 */
export async function getDashboardData(): Promise<DashboardData> {
  // Simulate network latency
  await new Promise((resolve) => window.setTimeout(resolve, 350))

  const pendingRequests = mockApprovalRequests
    .filter((req: ApprovalRequest) => req.status === 'pending')
    .sort((a: ApprovalRequest, b: ApprovalRequest) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .slice(0, 5)

  const pendingApprovalsCount = mockApprovalRequests.filter((r: ApprovalRequest) => r.status === 'pending').length
  const approvedRequestsCount = mockApprovalRequests.filter((r: ApprovalRequest) => r.status === 'approved').length
  const rejectedRequestsCount = mockApprovalRequests.filter((r: ApprovalRequest) => r.status === 'rejected').length
  const teamMembersCount = 12

  return {
    summary: {
      pendingApprovalsCount,
      approvedRequestsCount,
      rejectedRequestsCount,
      teamMembersCount,
    },
    pendingRequests,
    securityOverview: {
      compliancePercentage: 83,
      totalMembers: teamMembersCount,
      compliantDevicesCount: 10,
      attentionDevicesCount: 2,
      lastAssessedDate: '2026-10-24T09:00:00Z',
    },
    recentActivity: mockRecentActivity.map((item) => ({ ...item })),
    activityDate: '24 Oct 2026 · UTC',
    dataSource: dashboardDataSource,
  }
}
