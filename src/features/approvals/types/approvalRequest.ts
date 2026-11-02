export type ApprovalRequestStatus = 'pending' | 'approved' | 'rejected' | string

export type ApprovalDateRange = 'all' | 'today' | 'last-7-days' | 'last-30-days'

export interface ApprovalRequest {
  id: string
  employeeName: string
  resourceName: string
  resourceDescription?: string
  accessLevel?: string
  requestedAt: string
  status: ApprovalRequestStatus
}

export interface ApprovalFilters {
  search: string
  status: 'all' | 'pending' | 'approved' | 'rejected'
  resource: string
  dateRange: ApprovalDateRange
}
