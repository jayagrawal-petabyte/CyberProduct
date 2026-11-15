/**
 * BrainMint Access Requests API Service
 * CyberProduct Platform
 *
 * Communicates with GET /api/v1/access-requests, POST /api/v1/access-requests,
 * GET /api/v1/access-requests/:id
 *
 * Backend automatically scopes employee GET requests to their own records (RLS).
 */

import { apiGet, apiPost } from './apiClient';

export type BackendRequestStatus = 'pending' | 'approved' | 'rejected';

export interface BackendAccessRequest {
  id: string;
  company_id?: string;
  requester_id: string;
  resource_id: string;
  device_id: string | null;
  reason: string;
  status: BackendRequestStatus;
  requested_duration_minutes: number | null;
  assigned_lead_id?: string | null;
  decided_by?: string | null;
  decided_at?: string | null;
  decision_reason?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields (may be present depending on backend select)
  resource?: { id: string; name: string; category?: string };
  requester?: { id: string; full_name: string; email: string };
}

export interface SubmitAccessRequestPayload {
  resource_id: string;
  reason: string;
  device_id?: string;
  requested_duration_minutes?: number;
}

interface AccessRequestListResponse {
  success: boolean;
  data: BackendAccessRequest[];
}

interface AccessRequestSingleResponse {
  success: boolean;
  data: BackendAccessRequest;
}

/** Fetch all access requests for the authenticated user (employee-scoped by RLS). */
export async function getMyAccessRequests(
  filters: { status?: BackendRequestStatus } = {},
): Promise<BackendAccessRequest[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const result = await apiGet<AccessRequestListResponse>(`/api/v1/access-requests${qs}`);
  return result.data ?? [];
}

/** Fetch a single access request by ID. */
export async function getAccessRequestById(id: string): Promise<BackendAccessRequest> {
  const result = await apiGet<AccessRequestSingleResponse>(`/api/v1/access-requests/${id}`);
  return result.data;
}

/**
 * Submit a new access request.
 * Backend validation:
 *   - resource_id: required UUID
 *   - reason: required string, max 1000 chars
 *   - device_id: optional UUID
 *   - requested_duration_minutes: optional positive integer
 */
export async function submitAccessRequest(
  payload: SubmitAccessRequestPayload,
): Promise<BackendAccessRequest> {
  const result = await apiPost<AccessRequestSingleResponse>(
    '/api/v1/access-requests',
    payload,
  );
  return result.data;
}
