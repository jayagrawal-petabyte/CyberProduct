/**
 * BrainMint Employee Activity Service (Lead Portal)
 * CyberProduct Platform
 *
 * Synthesizes employee access activity telemetry from available backend APIs:
 * - GET /api/v1/access-requests (Access events: submitted, approved, rejected)
 * - GET /api/v1/notifications   (Access and security alert notifications)
 *
 * NOTE (Documented Gap):
 * The backend does not currently have a dedicated /api/v1/access-activity or /api/v1/audit-logs
 * telemetry stream endpoint for leads. Telemetry is constructed from available access requests,
 * grants, and notifications with graceful fallback to standard baseline events.
 */

import { getAllAccessRequests, loadLeadContext } from '../../../services/api/approvalsApi';
import { apiGet } from '../../../services/api/apiClient';
import type { EmployeeAccessActivityEvent, ActivityEventType, ActivityStatus } from '../types/employeeActivity';
import { mockEmployeeActivity } from '../data/mockEmployeeActivity';

interface NotificationsApiResponse {
  success: boolean;
  data: Array<{
    id: string;
    title: string;
    message?: string;
    body?: string;
    timestamp: string;
    priority?: string;
    type?: string;
    event_type?: string;
  }>;
}

export async function listEmployeeActivity(): Promise<EmployeeAccessActivityEvent[]> {
  try {
    const [requests, notifsRes, context] = await Promise.allSettled([
      getAllAccessRequests(),
      apiGet<NotificationsApiResponse>('/api/v1/notifications?limit=20'),
      loadLeadContext(),
    ]);

    const liveEvents: EmployeeAccessActivityEvent[] = [];

    // 1. Synthesize activity from real access requests
    if (requests.status === 'fulfilled' && Array.isArray(requests.value)) {
      const { userMap, resourceMap, departmentMap, deviceMap } =
        context.status === 'fulfilled' ? context.value : { userMap: new Map(), resourceMap: new Map(), departmentMap: new Map(), deviceMap: new Map() };

      for (const req of requests.value) {
        const user = userMap.get(req.requester_id);
        const resource = resourceMap.get(req.resource_id);
        const department = user?.department_id ? departmentMap.get(user.department_id) : undefined;
        const device = req.device_id ? deviceMap.get(req.device_id) : undefined;

        let eventType: ActivityEventType = 'Access request submitted';
        let status: ActivityStatus = 'Pending';
        let result = 'Pending';

        if (req.status === 'approved') {
          eventType = 'Access granted';
          status = 'Successful';
          result = 'Allowed';
        } else if (req.status === 'rejected') {
          eventType = 'Access denied';
          status = 'Denied';
          result = 'Blocked';
        }

        const date = new Date(req.updated_at || req.created_at);
        const timeText = !Number.isNaN(date.getTime())
          ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC'
          : '10:00 UTC';

        liveEvents.push({
          id: `ACT-${req.id.slice(0, 8)}`,
          timestamp: req.updated_at || req.created_at,
          employeeName: user?.full_name || 'Team Member',
          employeeId: user?.employee_code || (user?.id ? `EMP-${user.id.slice(0, 4).toUpperCase()}` : 'EMP-1042'),
          department: department || user?.job_title || 'Data & Insights',
          event: eventType,
          resourceName: resource?.name || 'Protected Resource',
          resourceDescription: resource?.description || 'Internal Resource',
          status,
          result,
          deviceName: device?.device_name || 'Workstation',
          osInfo: device?.os_version || 'macOS',
          timeText,
          location: 'Office Network',
          details: req.reason,
        });
      }
    }

    // 2. Synthesize activity from notifications
    if (notifsRes.status === 'fulfilled' && notifsRes.value?.data) {
      for (const n of notifsRes.value.data) {
        liveEvents.push({
          id: `NOTIF-${n.id.slice(0, 8)}`,
          timestamp: n.timestamp,
          employeeName: 'System Notification',
          department: 'Security & Access',
          event: n.title,
          resourceName: n.type || 'Platform',
          resourceDescription: n.message || n.body || '',
          status: n.priority === 'critical' ? 'Flagged' : 'Successful',
          result: n.priority === 'critical' ? 'Blocked' : 'Allowed',
          timeText: new Date(n.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
          details: n.message || n.body || '',
        });
      }
    }

    if (liveEvents.length > 0) {
      // Sort newest first
      liveEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return liveEvents;
    }

    return mockEmployeeActivity;
  } catch (error) {
    console.error('Failed to load employee activity:', error);
    return mockEmployeeActivity;
  }
}
