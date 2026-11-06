import type { ApprovalRequest } from '../../approvals/types/approvalRequest'

export interface DashboardSummary {
  pendingApprovalsCount: number
  approvedRequestsCount: number
  rejectedRequestsCount: number
  teamMembersCount: number
}

export interface TeamSecurityOverview {
  compliancePercentage: number
  totalMembers: number
  compliantDevicesCount: number
  attentionDevicesCount: number
  lastAssessedDate: string
}

export type RecentActivityType = 'request_submitted' | 'request_approved' | 'compliance_alert'

export interface RecentActivityItem {
  id: string
  type: RecentActivityType
  title: string
  description: string
  time: string
  timestamp: string
}

export interface DashboardData {
  summary: DashboardSummary
  pendingRequests: ApprovalRequest[]
  securityOverview: TeamSecurityOverview
  recentActivity: RecentActivityItem[]
  activityDate: string
  dataSource: string
}
