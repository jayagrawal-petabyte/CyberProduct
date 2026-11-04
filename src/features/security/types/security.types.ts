export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export type EventType = 'REQUEST' | 'APPROVAL' | 'BLOCK' | 'VIOLATION' | string;

export type AuditStatus = 'PENDING' | 'APPROVED' | 'BLOCKED' | 'COMPLIANT' | string;

export interface AlertItem {
  id: string;
  timestamp: string;
  severity: SeverityLevel;
  status: AlertStatus;
  employeeName: string;
  device: string;
  resource: string;
  evidenceFields: {
    ipAddress: string;
    triggerRule: string;
    details: string;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  eventType: EventType;
  status: AuditStatus;
  actor: string;
  details: string;
}