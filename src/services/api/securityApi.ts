/**
 * BrainMint Security Administrator API Service
 * CyberProduct Platform
 *
 * Implements real backend integration for Security Administration:
 * - Policies: GET/POST/PATCH /api/v1/policies (RBAC: security_admin only)
 * - Resources: GET/POST/PATCH /api/v1/resources, GET /api/v1/resources/categories
 * - Users: GET/PATCH /api/v1/users, GET /api/v1/departments
 * - Devices: GET/PATCH /api/v1/devices, PATCH /api/v1/devices/:id/revoke
 * - Notifications & Alerts: GET/PATCH /api/v1/notifications
 *
 * Enforces company tenant isolation and RBAC.
 */

import { apiGet, apiPost, apiPatch } from './apiClient';
import type { BackendUserProfile, UpdateProfilePayload } from './usersApi';
import type { BackendDevice } from './devicesApi';
import type { BackendResource } from './resourcesApi';

// ── Types ────────────────────────────────────────────────────────────────────

export interface BackendPolicy {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  effect: 'ALLOW' | 'BLOCK' | 'REQUIRES_APPROVAL';
  resource_id: string | null;
  category_id: string | null;
  applies_to_role: string | null;
  applies_to_department_id: string | null;
  require_authorized_network: boolean;
  require_compliant_device: boolean;
  max_grant_minutes: number | null;
  priority: number;
  extra_conditions?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreatePolicyPayload {
  name: string;
  description?: string;
  effect: 'ALLOW' | 'BLOCK' | 'REQUIRES_APPROVAL';
  resource_id?: string;
  category_id?: string;
  applies_to_role?: string;
  applies_to_department_id?: string;
  require_authorized_network?: boolean;
  require_compliant_device?: boolean;
  max_grant_minutes?: number | null;
  priority?: number;
  extra_conditions?: Record<string, unknown>;
}

export type UpdatePolicyPayload = Partial<CreatePolicyPayload>;

export interface CreateResourcePayload {
  name: string;
  resource_type: string;
  identifier: string;
  category_id?: string;
  description?: string;
  sensitivity?: string;
}

export interface UpdateResourcePayload {
  name?: string;
  identifier?: string;
  category_id?: string;
  description?: string;
  sensitivity?: string;
  status?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Policies API ─────────────────────────────────────────────────────────────

export async function listSecurityPolicies(params: {
  page?: number;
  limit?: number;
  status?: string;
  effect?: string;
} = {}): Promise<{ policies: BackendPolicy[]; pagination?: ApiResponse<unknown>['pagination'] }> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status) query.set('status', params.status);
  if (params.effect) query.set('effect', params.effect);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const result = await apiGet<ApiResponse<BackendPolicy[]>>(`/api/v1/policies${qs}`);
  return {
    policies: result.data ?? [],
    pagination: result.pagination,
  };
}

export async function getSecurityPolicyById(id: string): Promise<BackendPolicy> {
  const result = await apiGet<ApiResponse<BackendPolicy>>(`/api/v1/policies/${id}`);
  return result.data;
}

export async function createSecurityPolicy(payload: CreatePolicyPayload): Promise<BackendPolicy> {
  const result = await apiPost<ApiResponse<BackendPolicy>>('/api/v1/policies', payload);
  return result.data;
}

export async function updateSecurityPolicy(id: string, payload: UpdatePolicyPayload): Promise<BackendPolicy> {
  const result = await apiPatch<ApiResponse<BackendPolicy>>(`/api/v1/policies/${id}`, payload);
  return result.data;
}

// ── Resources API ────────────────────────────────────────────────────────────

export async function listSecurityResources(params: {
  page?: number;
  limit?: number;
  category_id?: string;
  resource_type?: string;
  status?: string;
} = {}): Promise<BackendResource[]> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.category_id) query.set('category_id', params.category_id);
  if (params.resource_type) query.set('resource_type', params.resource_type);
  if (params.status) query.set('status', params.status);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const result = await apiGet<ApiResponse<BackendResource[]>>(`/api/v1/resources${qs}`);
  return result.data ?? [];
}

export async function createSecurityResource(payload: CreateResourcePayload): Promise<BackendResource> {
  const result = await apiPost<ApiResponse<BackendResource>>('/api/v1/resources', payload);
  return result.data;
}

export async function updateSecurityResource(id: string, payload: UpdateResourcePayload): Promise<BackendResource> {
  const result = await apiPatch<ApiResponse<BackendResource>>(`/api/v1/resources/${id}`, payload);
  return result.data;
}

export async function listResourceCategories(): Promise<Array<{ id: string; name: string }>> {
  const result = await apiGet<ApiResponse<Array<{ id: string; name: string }>>>('/api/v1/resources/categories');
  return result.data ?? [];
}

// ── Users & Departments API ──────────────────────────────────────────────────

export async function listSecurityUsers(): Promise<BackendUserProfile[]> {
  const result = await apiGet<ApiResponse<BackendUserProfile[]>>('/api/v1/users');
  return result.data ?? [];
}

export async function updateSecurityUser(id: string, payload: UpdateProfilePayload): Promise<BackendUserProfile> {
  const result = await apiPatch<ApiResponse<BackendUserProfile>>(`/api/v1/users/${id}`, payload);
  return result.data;
}

export async function listSecurityDepartments(): Promise<Array<{ id: string; name: string }>> {
  const result = await apiGet<ApiResponse<Array<{ id: string; name: string }>>>('/api/v1/departments');
  return result.data ?? [];
}

// ── Devices API ──────────────────────────────────────────────────────────────

export async function listSecurityDevices(): Promise<BackendDevice[]> {
  const result = await apiGet<ApiResponse<BackendDevice[]>>('/api/v1/devices');
  return result.data ?? [];
}

export async function revokeSecurityDevice(id: string, reason?: string): Promise<BackendDevice> {
  const body = reason?.trim() ? { reason: reason.trim() } : {};
  const result = await apiPatch<ApiResponse<BackendDevice>>(`/api/v1/devices/${id}/revoke`, body);
  return result.data;
}

// ── Notifications / Alerts API ───────────────────────────────────────────────

export async function listSecurityAlerts(): Promise<Array<{
  id: string;
  title: string;
  message: string;
  timestamp: string;
  priority: string;
  type: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}>> {
  const result = await apiGet<{ success: boolean; data: Array<any> }>('/api/v1/notifications?limit=50');
  return (result.data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message || n.body || '',
    timestamp: n.timestamp,
    priority: n.priority || 'medium',
    type: n.type || 'security',
    actionUrl: n.actionUrl,
    metadata: n.metadata,
  }));
}
