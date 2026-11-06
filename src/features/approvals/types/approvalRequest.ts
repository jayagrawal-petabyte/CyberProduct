export type ApprovalRequestStatus = 'pending' | 'approved' | 'rejected' | string

export type ApprovalDateRange = 'all' | 'today' | 'last-7-days' | 'last-30-days'

export interface ApprovalRequest {
  id: string
  employeeName: string
  employeeEmail?: string
  department?: string
  role?: string
  manager?: string
  resourceName: string
  resourceDescription?: string
  accessLevel?: string
  duration?: string
  businessJustification?: string
  requestedAt: string
  status: ApprovalRequestStatus
  mfaStatus?: 'Enabled' | 'Disabled'
  deviceCompliance?: 'Compliant' | 'Non-compliant'
  policyCheck?: 'Passed' | 'Failed'
  decisionNotes?: string
  reviewedBy?: string
  reviewedAt?: string
}

export interface ApprovalFilters {
  search: string
  status: 'all' | 'pending' | 'approved' | 'rejected'
  resource: string
  dateRange: ApprovalDateRange
}
