import { AlertItem, AuditLogItem } from '../types/security.types';

export const mockAlerts: AlertItem[] = [
  {
    id: 'ALT-101',
    timestamp: '2026-10-24 14:32:10',
    severity: 'HIGH',
    status: 'ACTIVE',
    employeeName: 'Rahul Sharma',
    device: 'DEV-MBP-042',
    resource: 'Production Database (SQL)',
    evidenceFields: {
      ipAddress: '192.168.1.45',
      triggerRule: 'Unauthorized Port Access',
      details: 'Multiple failed schema drop attempts detected.'
    }
  },
  {
    id: 'ALT-102',
    timestamp: '2026-10-24 12:15:00',
    severity: 'MEDIUM',
    status: 'INVESTIGATING',
    employeeName: 'Priya Patel',
    device: 'DEV-WIN-112',
    resource: 'AWS Console - S3 Bucket',
    evidenceFields: {
      ipAddress: '192.168.1.88',
      triggerRule: 'Out-of-Hours Access',
      details: 'Accessed restricted financial bucket outside standard shift.'
    }
  }
];

export const mockAuditLogs: AuditLogItem[] = [
  {
    id: 'LOG-501',
    timestamp: '2026-10-24 10:00:05',
    eventType: 'REQUEST',
    status: 'PENDING',
    actor: 'Aarushi Srivastava',
    details: 'Requested access to Internal Git Repository.'
  },
  {
    id: 'LOG-502',
    timestamp: '2026-10-24 09:30:12',
    eventType: 'BLOCK',
    status: 'BLOCKED',
    actor: 'System Firewall',
    details: 'Blocked outbound payload to unauthorized domain.'
  }
];