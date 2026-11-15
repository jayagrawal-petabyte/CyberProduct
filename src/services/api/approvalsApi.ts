/**
 * BrainMint Approvals API Service
 * CyberProduct Platform
 *
 * Implements real backend integration for the Team Lead / Approvals module:
 * - GET   /api/v1/approvals/pending        (List pending approvals for team lead)
 * - PATCH /api/v1/approvals/:id/approve    (Approve access request)
 * - PATCH /api/v1/approvals/:id/reject     (Reject access request)
 * - GET   /api/v1/access-requests          (List company access requests / history)
 * - GET   /api/v1/access-requests/:id      (Get specific request by ID)
 *
 * Enforces company data isolation, role authorization, and no self-approval.
 */

import { apiGet, apiPatch } from './apiClient';
import type { BackendAccessRequest } from './accessRequestsApi';
import type { BackendResource } from './resourcesApi';
import type { BackendUserProfile } from './usersApi';
import type { BackendDevice } from './devicesApi';
import { getResources } from './resourcesApi';

export interface BackendApprovalDecisionResult {
  request: BackendAccessRequest;
  grant?: unknown;
  policy?: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Fetch pending access requests awaiting review by the authenticated lead.
 */
export async function getPendingApprovals(): Promise<BackendAccessRequest[]> {
  const result = await apiGet<ApiResponse<BackendAccessRequest[]>>('/api/v1/approvals/pending');
  return result.data ?? [];
}

/**
 * Approve an access request with an optional decision reason.
 * Backend verifies: lead or admin role, company isolation, and no self-approval.
 */
export async function approveAccessRequest(
  requestId: string,
  decisionReason?: string,
): Promise<BackendApprovalDecisionResult> {
  const body = decisionReason?.trim() ? { decision_reason: decisionReason.trim() } : {};
  const result = await apiPatch<ApiResponse<BackendApprovalDecisionResult | BackendAccessRequest>>(
    `/api/v1/approvals/${requestId}/approve`,
    body,
  );
  if ('request' in result.data) {
    return result.data as BackendApprovalDecisionResult;
  }
  return { request: result.data as BackendAccessRequest };
}

/**
 * Reject an access request with an optional decision reason.
 * Backend verifies: lead or admin role, company isolation, and no self-approval.
 */
export async function rejectAccessRequest(
  requestId: string,
  decisionReason?: string,
): Promise<BackendAccessRequest> {
  const body = decisionReason?.trim() ? { decision_reason: decisionReason.trim() } : {};
  const result = await apiPatch<ApiResponse<BackendAccessRequest>>(
    `/api/v1/approvals/${requestId}/reject`,
    body,
  );
  return result.data;
}

/**
 * Fetch all access requests for the lead's company (used for Approval History and metrics).
 */
export async function getAllAccessRequests(
  filters: { status?: 'pending' | 'approved' | 'rejected'; requester_id?: string } = {},
): Promise<BackendAccessRequest[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.requester_id) params.set('requester_id', filters.requester_id);
  const qs = params.toString() ? `?${params.toString()}` : '';

  const result = await apiGet<ApiResponse<BackendAccessRequest[]>>(`/api/v1/access-requests${qs}`);
  return result.data ?? [];
}

/**
 * Fetch a single access request by ID.
 */
export async function getAccessRequestById(requestId: string): Promise<BackendAccessRequest> {
  const result = await apiGet<ApiResponse<BackendAccessRequest>>(`/api/v1/access-requests/${requestId}`);
  return result.data;
}

/**
 * Fetch all users in the authenticated lead's company (for enriching requester details).
 */
export async function getCompanyUsers(): Promise<BackendUserProfile[]> {
  const result = await apiGet<ApiResponse<BackendUserProfile[]>>('/api/v1/users');
  return result.data ?? [];
}

/**
 * Fetch all departments in the company.
 */
export async function getCompanyDepartments(): Promise<{ id: string; name: string }[]> {
  const result = await apiGet<ApiResponse<{ id: string; name: string }[]>>('/api/v1/departments');
  return result.data ?? [];
}

/**
 * Fetch all devices in the company.
 */
export async function getCompanyDevices(): Promise<BackendDevice[]> {
  const result = await apiGet<ApiResponse<BackendDevice[]>>('/api/v1/devices');
  return result.data ?? [];
}

/**
 * Helper to load enrichment context (users, resources, departments, devices) in parallel.
 */
export async function loadLeadContext() {
  const [usersRes, resourcesRes, departmentsRes, devicesRes] = await Promise.allSettled([
    getCompanyUsers(),
    getResources(),
    getCompanyDepartments(),
    getCompanyDevices(),
  ]);

  const users = usersRes.status === 'fulfilled' ? usersRes.value : [];
  const resources = resourcesRes.status === 'fulfilled' ? resourcesRes.value : [];
  const departments = departmentsRes.status === 'fulfilled' ? departmentsRes.value : [];
  const devices = devicesRes.status === 'fulfilled' ? devicesRes.value : [];

  const userMap = new Map<string, BackendUserProfile>(users.map((u) => [u.id, u]));
  const resourceMap = new Map<string, BackendResource>(resources.map((r) => [r.id, r]));
  const departmentMap = new Map<string, string>(departments.map((d) => [d.id, d.name]));
  const deviceMap = new Map<string, BackendDevice>(devices.map((d) => [d.id, d]));

  return { userMap, resourceMap, departmentMap, deviceMap };
}
