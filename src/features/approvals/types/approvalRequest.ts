export type ApprovalRequestStatus = 'pending' | 'approved' | 'rejected' | string

export type ApprovalDateRange = 'all' | 'today' | 'last-7-days' | 'last-30-days'

export interface ApprovalRequest {
  id: string
  employeeName: string
  employeeId?: string
  employeeEmail?: string
  department?: string
  role?: string
  manager?: string
  resourceName: string
  resourceDescription?: string
  resourceOwner?: string
  projectReference?: string
  accessLevel?: string
  duration?: string
  businessJustification?: string
  requestedPermission?: string
  expiration?: string
  requestedAt: string
  status: ApprovalRequestStatus
  compliance?: 'Compliant' | 'At risk' | string
  deviceInfo?: string
  osInfo?: string
  postureChecks?: string[]
  mfaStatus?: 'Enabled' | 'Disabled'
  deviceCompliance?: 'Compliant' | 'Non-compliant' | string
  policyCheck?: 'Passed' | 'Failed' | string
  decisionNotes?: string
  decisionReason?: string
  reviewedBy?: string
  reviewedAt?: string
  submittedTimeText?: string
}

export interface ApprovalFilters {
  search: string
  status: 'all' | 'pending' | 'approved' | 'rejected'
  resource: string
  dateRange: ApprovalDateRange
}
