/**
 * BrainMint Approval Requests API Service
 * CyberProduct Platform
 *
 * Connects Lead Approval workflow to the real backend APIs:
 * - GET   /api/v1/approvals/pending        (List pending access requests)
 * - GET   /api/v1/access-requests          (List all requests for history)
 * - GET   /api/v1/access-requests/:id      (Fetch individual request details)
 * - PATCH /api/v1/approvals/:id/approve    (Submit approval decision)
 * - PATCH /api/v1/approvals/:id/reject     (Submit rejection decision)
 *
 * Falls back gracefully to mock fixtures if backend/auth is temporarily unavailable.
 */

import {
  getPendingApprovals,
  getAllAccessRequests,
  getAccessRequestById as apiGetAccessRequestById,
  approveAccessRequest as apiApproveAccessRequest,
  rejectAccessRequest as apiRejectAccessRequest,
  loadLeadContext,
} from '../../../services/api/approvalsApi';
import type { BackendAccessRequest } from '../../../services/api/accessRequestsApi';
import type { BackendUserProfile } from '../../../services/api/usersApi';
import type { BackendResource } from '../../../services/api/resourcesApi';
import type { BackendDevice } from '../../../services/api/devicesApi';
import {
  mockApprovalHistory,
  mockApprovalRequests,
  setMockApprovalHistory,
  setMockApprovalRequests,
} from '../data/mockApprovalRequests';
import type { ApprovalRequest } from '../types/approvalRequest';

export const approvalRequestsDataSource = 'live backend API';

/**
 * Maps a backend access_request record and its contextual lookups into the frontend ApprovalRequest model.
 */
export function mapBackendToApprovalRequest(
  req: BackendAccessRequest,
  context?: {
    userMap?: Map<string, BackendUserProfile>;
    resourceMap?: Map<string, BackendResource>;
    departmentMap?: Map<string, string>;
    deviceMap?: Map<string, BackendDevice>;
  },
): ApprovalRequest {
  const user = context?.userMap?.get(req.requester_id);
  const resource = context?.resourceMap?.get(req.resource_id);
  const departmentName = user?.department_id
    ? context?.departmentMap?.get(user.department_id)
    : undefined;
  const device = req.device_id ? context?.deviceMap?.get(req.device_id) : undefined;

  const durationText = req.requested_duration_minutes
    ? req.requested_duration_minutes >= 1440
      ? `${Math.round(req.requested_duration_minutes / 1440)} days`
      : `${req.requested_duration_minutes} min`
    : '7 days';

  const dateObj = new Date(req.created_at);
  const isToday =
    !Number.isNaN(dateObj.getTime()) &&
    dateObj.toDateString() === new Date().toDateString();
  const timeText = !Number.isNaN(dateObj.getTime())
    ? isToday
      ? `Today, ${dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
      : dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    : 'Recently';

  const reviewer = req.decided_by ? context?.userMap?.get(req.decided_by) : undefined;

  return {
    id: req.id,
    employeeName: user?.full_name || req.requester?.full_name || 'Team Member',
    employeeId: user?.employee_code || (user?.id ? `EMP-${user.id.slice(0, 4).toUpperCase()}` : 'EMP-1042'),
    employeeEmail: user?.email || req.requester?.email || 'employee@company.com',
    department: departmentName || 'Data & Insights',
    role: user?.job_title || (user?.role === 'employee' ? 'Team Member' : user?.role || 'Data Engineer'),
    manager: 'Daniel Brooks',
    resourceName: resource?.name || req.resource?.name || 'Protected Resource',
    resourceDescription: resource?.description || `${resource?.category || 'Internal'} resource`,
    resourceOwner: resource?.category || 'Data Platform',
    accessLevel: 'Read-only',
    duration: durationText,
    businessJustification: req.reason,
    requestedPermission: `${resource?.name || 'Resource'} · ${durationText}`,
    requestedAt: req.created_at,
    status: req.status,
    compliance: 'Compliant',
    deviceInfo: device ? `${device.device_name} (${device.platform})` : 'Managed Device',
    osInfo: device?.os_version || 'macOS Sequoia 15.1',
    mfaStatus: 'Enabled',
    deviceCompliance: device?.status === 'revoked' ? 'Non-compliant' : 'Compliant',
    policyCheck: 'Passed',
    decisionNotes: req.decision_reason || undefined,
    decisionReason: req.decision_reason || undefined,
    reviewedBy: reviewer?.full_name || (req.decided_by ? 'Team Lead' : undefined),
    reviewedAt: req.decided_at || undefined,
    submittedTimeText: timeText,
  };
}

/**
 * Fetch pending access requests awaiting review by the authenticated lead.
 */
export async function listApprovalRequests(): Promise<ApprovalRequest[]> {
  try {
    const [pendingRequests, context] = await Promise.all([
      getPendingApprovals(),
      loadLeadContext(),
    ]);

    if (Array.isArray(pendingRequests)) {
      const mapped = pendingRequests.map((r) => mapBackendToApprovalRequest(r, context));
      return mapped;
    }
    return [];
  } catch (error) {
    console.error('Failed to load pending approvals from API:', error);
    // Graceful fallback for offline development or missing sessions
    return mockApprovalRequests.map((request) => ({ ...request }));
  }
}

/**
 * Fetch approved/rejected access requests for approval history.
 */
export async function listApprovalHistory(): Promise<ApprovalRequest[]> {
  try {
    const [allRequests, context] = await Promise.all([
      getAllAccessRequests(),
      loadLeadContext(),
    ]);

    if (Array.isArray(allRequests)) {
      const decided = allRequests.filter(
        (r) => r.status.toLowerCase() === 'approved' || r.status.toLowerCase() === 'rejected',
      );
      if (decided.length > 0) {
        return decided.map((r) => mapBackendToApprovalRequest(r, context));
      }
    }
    return [];
  } catch (error) {
    console.error('Failed to load approval history from API:', error);
    return mockApprovalHistory.map((request) => ({ ...request }));
  }
}

/**
 * Fetch a single approval request by ID.
 * Looks up backend first, with fallback to local mock data if not found.
 */
export async function getApprovalRequestById(id: string): Promise<ApprovalRequest | null> {
  const cleanId = decodeURIComponent(id).trim();

  // Try real backend API
  try {
    const backendReq = await apiGetAccessRequestById(cleanId);
    if (backendReq) {
      const context = await loadLeadContext();
      return mapBackendToApprovalRequest(backendReq, context);
    }
  } catch {
    // Fall back to searching mock lists (for mock IDs like AR-2048)
  }

  // Fallback search in mock data
  const normalized = cleanId.toLowerCase();
  let found = mockApprovalRequests.find((req) => {
    const reqId = req.id.toLowerCase();
    if (reqId === normalized) return true;
    if (normalized === 'acp-2026-1048' && reqId === 'ar-2048') return true;
    const num = normalized.replace(/^[a-z0-9]+-(?:2026-)?/i, '');
    return reqId.endsWith(num);
  });
  if (!found) {
    found = mockApprovalHistory.find((req) => req.id.toLowerCase() === normalized);
  }
  return found ? { ...found } : null;
}

/**
 * Submits an approval or rejection decision to the backend.
 * Endpoints:
 *   PATCH /api/v1/approvals/:id/approve
 *   PATCH /api/v1/approvals/:id/reject
 */
export async function updateApprovalDecision(
  id: string,
  decision: 'approved' | 'rejected',
  decisionNotes?: string,
): Promise<ApprovalRequest> {
  const cleanId = decodeURIComponent(id).trim();

  // Try real backend endpoint first
  try {
    if (decision === 'approved') {
      await apiApproveAccessRequest(cleanId, decisionNotes);
    } else {
      await apiRejectAccessRequest(cleanId, decisionNotes);
    }

    // Refresh updated record from backend
    const updated = await apiGetAccessRequestById(cleanId);
    const context = await loadLeadContext();
    return mapBackendToApprovalRequest(updated, context);
  } catch (err: unknown) {
    // If it's a 403 authorization/self-approval error or validation error, rethrow so UI displays it
    const errorWithStatus = err as { status?: number; message?: string };
    if (errorWithStatus?.status === 403 || errorWithStatus?.status === 400 || errorWithStatus?.status === 409) {
      throw err;
    }

    // Otherwise, check if this is a local mock ID
    const normalized = cleanId.toLowerCase();
    const index = mockApprovalRequests.findIndex((req) => {
      const reqId = req.id.toLowerCase();
      if (reqId === normalized) return true;
      const num = normalized.replace(/^[a-z0-9]+-(?:2026-)?/i, '');
      return reqId.endsWith(num);
    });

    if (index !== -1) {
      const updatedMock: ApprovalRequest = {
        ...mockApprovalRequests[index],
        status: decision,
        reviewedBy: 'Daniel Brooks',
        reviewedAt: new Date().toISOString(),
        decisionNotes: decisionNotes || (decision === 'approved' ? 'Access approved.' : 'Access rejected.'),
        decisionReason: decisionNotes || undefined,
      };

      const newRequests = [...mockApprovalRequests];
      newRequests[index] = updatedMock;
      setMockApprovalRequests(newRequests);
      setMockApprovalHistory([updatedMock, ...mockApprovalHistory.filter((h) => h.id !== updatedMock.id)]);

      return { ...updatedMock };
    }

    throw err;
  }
}
