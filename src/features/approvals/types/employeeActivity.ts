export type ActivityStatus = 'Successful' | 'Flagged' | 'Denied' | 'Pending' | 'Updated'

export type ActivityEventType =
  | 'Access granted'
  | 'Unusual login detected'
  | 'Access denied'
  | 'Access request submitted'
  | 'Permission updated'
  | 'Session logged out'

export interface EmployeeAccessActivityEvent {
  id: string
  timestamp: string
  employeeName: string
  department: string
  event: ActivityEventType
  resourceName: string
  resourceDescription: string
  status: ActivityStatus
  ipAddress?: string
  deviceName?: string
  location?: string
  details?: string
  flagReason?: string
}

export interface ActivityFilterOptions {
  search: string
  eventType: string
  employee: string
  resource: string
  dateRange: string
}

