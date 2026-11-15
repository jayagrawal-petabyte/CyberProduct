export type ActivityStatus = 'Successful' | 'Flagged' | 'Denied' | 'Pending' | 'Updated' | 'Allowed' | 'Blocked' | string

export type ActivityEventType =
  | 'Access granted'
  | 'Unusual login detected'
  | 'Access denied'
  | 'Access request submitted'
  | 'Permission updated'
  | 'Session logged out'
  | 'Session started'
  | 'Sign-in blocked'
  | string

export interface EmployeeAccessActivityEvent {
  id: string
  timestamp: string
  employeeName: string
  employeeId?: string
  department: string
  event: ActivityEventType
  resourceName: string
  resourceDescription: string
  status: ActivityStatus
  result?: 'Allowed' | 'Blocked' | string
  ipAddress?: string
  deviceName?: string
  osInfo?: string
  timeText?: string
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
