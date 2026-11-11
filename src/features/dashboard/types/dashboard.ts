import type { ApprovalRequest } from '../../approvals/types/approvalRequest'

export interface DashboardSummary {
  pendingCount: string
  pendingSlaText: string
  approvedWeekCount: number
  approvedWeekDiff: string
  avgReviewTime: string
  avgReviewTarget: string
  teamMembersCount: number
  teamName: string

  // Backward compatibility fields
  pendingApprovalsCount?: number
  approvedRequestsCount?: number
  rejectedRequestsCount?: number
  reviewSlaHours?: number
}

export interface RequestVolumeDay {
  day: string
  approved: number
  submitted: number
}

export interface LatestDecision {
  title: string
  subtitle: string
  time: string
}

export interface TeamActivityEvent {
  id: string
  title: string
  description: string
  time: string
  icon: 'key' | 'monitor'
}

export interface RecentActivityItem {
  id: string
  type: 'request_submitted' | 'request_approved' | 'compliance_alert'
  title: string
  description: string
  timestamp: string
  time: string
}

export interface TeamSecurityOverview {
  compliancePercentage: number
  totalMembers: number
  compliantDevicesCount: number
  nonCompliantDevicesCount?: number
  attentionDevicesCount?: number
}

export interface DashboardData {
  summary: DashboardSummary
  priorityRequests: ApprovalRequest[]
  requestVolume: RequestVolumeDay[]
  latestDecision: LatestDecision
  teamActivity: TeamActivityEvent[]
  securityOverview?: TeamSecurityOverview
  recentActivity?: RecentActivityItem[]
}
