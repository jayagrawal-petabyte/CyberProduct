/**
 * BrainMint Security Admin Feature Types
 * Scope: src/features/admin/types/admin.types.ts
 */

export interface AdminKPICard {
  id: string
  title: string
  value: string | number
  label?: string
  subtext: string
  iconName: 'user' | 'monitor' | 'shield-check' | 'alert-triangle' | 'clock' | 'diamond-plus' | 'lock'
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

export interface GatewayComplianceItem {
  name: string
  activeGateways: number
  totalGateways: number
  compliancePercent: number
  status: 'compliant' | 'warning' | 'non-compliant'
}

export interface NetworkComplianceData {
  complianceScore: number
  gatewayTlsPercent: number
  activeGateways: number
  totalGateways: number
  isolatedSubnets: number
  gateways: GatewayComplianceItem[]
}

export interface DevicePostureItem {
  osName: string
  deviceCount: number
  compliancePercent: number
}

export interface DevicePostureData {
  totalDevices: number
  compliantCount: number
  pendingCount: number
  criticalCount: number
  osList: DevicePostureItem[]
}

export interface ResourceClassDemand {
  category: string
  activeRequests: number
  trendLabel: string
}

export interface AccessDemandData {
  pendingReviewCount: number
  autoApprovedTodayCount: number
  avgResponseTimeHours: number
  resourceClasses: ResourceClassDemand[]
}

export interface PolicyViolationSummaryData {
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  topTriggerPolicy: string
}

export interface SecurityActivityRecord {
  id: string
  eventType: string
  actorName: string
  actorEmail: string
  targetResource: string
  resourceCategory: string
  actionDetails: string
  status: 'active' | 'pending' | 'compliant' | 'attention' | 'rejected' | 'approved'
  statusLabel: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  ipAddress: string
  timestamp: string
}

export interface AdminDashboardState {
  lastUpdated: string
  kpis: AdminKPICard[]
  networkCompliance: NetworkComplianceData
  devicePosture: DevicePostureData
  accessDemand: AccessDemandData
  policyViolations: PolicyViolationSummaryData
  recentActivities: SecurityActivityRecord[]
}
