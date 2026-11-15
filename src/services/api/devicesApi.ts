/**
 * BrainMint Devices API Service
 * CyberProduct Platform
 *
 * Communicates with GET /api/v1/devices, POST /api/v1/devices/register,
 * PATCH /api/v1/devices/:id, PATCH /api/v1/devices/:id/revoke
 *
 * Employees are automatically scoped to their own devices by the backend (RLS).
 */

import { apiGet, apiPost, apiPatch } from './apiClient';

export interface BackendDevice {
  id: string;
  company_id: string;
  owner_id: string;
  device_name: string;
  device_type: string; // 'laptop' | 'desktop' | 'mobile' | 'tablet' | …
  platform: string;
  os_version: string | null;
  hardware_id: string;
  status: string; // 'active' | 'revoked' | 'pending'
  registered_by: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterDevicePayload {
  device_name: string;
  device_type: string;
  platform: string;
  os_version?: string;
  hardware_id: string;
}

interface DeviceListResponse {
  success: boolean;
  data: BackendDevice[];
}

interface DeviceSingleResponse {
  success: boolean;
  data: BackendDevice;
}

/** Fetch all devices belonging to the authenticated employee. */
export async function getMyDevices(): Promise<BackendDevice[]> {
  const result = await apiGet<DeviceListResponse>('/api/v1/devices');
  return result.data ?? [];
}

/** Fetch a single device by ID. */
export async function getDeviceById(id: string): Promise<BackendDevice> {
  const result = await apiGet<DeviceSingleResponse>(`/api/v1/devices/${id}`);
  return result.data;
}

/** Register a new device for the authenticated employee. */
export async function registerDevice(payload: RegisterDevicePayload): Promise<BackendDevice> {
  const result = await apiPost<DeviceSingleResponse>('/api/v1/devices/register', payload);
  return result.data;
}

/** Update device details. */
export async function updateDevice(
  id: string,
  changes: Partial<Pick<BackendDevice, 'device_name' | 'os_version'>>,
): Promise<BackendDevice> {
  const result = await apiPatch<DeviceSingleResponse>(`/api/v1/devices/${id}`, changes);
  return result.data;
}

/** Revoke a device. */
export async function revokeDevice(id: string): Promise<BackendDevice> {
  const result = await apiPatch<DeviceSingleResponse>(`/api/v1/devices/${id}/revoke`, {});
  return result.data;
}
