/**
 * BrainMint Users API Service
 * CyberProduct Platform
 *
 * Communicates with GET /api/v1/users/:id and PATCH /api/v1/users/:id
 * Used by the Profile page to load and update the authenticated user's profile.
 *
 * Backend enforces: users can only read/update their own record unless security_admin.
 * Allowed update fields: full_name, employee_code, department_id, manager_id, job_title
 */

import { apiGet, apiPatch } from './apiClient';

export interface BackendUserProfile {
  id: string;
  company_id: string;
  employee_code: string | null;
  full_name: string;
  email: string;
  role: string;
  department_id: string | null;
  manager_id: string | null;
  job_title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  employee_code?: string;
  department_id?: string;
  manager_id?: string;
  job_title?: string;
}

interface UserProfileResponse {
  success: boolean;
  data: BackendUserProfile;
}

/** Fetch a user profile by ID. Employees can only fetch their own. */
export async function getUserProfile(userId: string): Promise<BackendUserProfile> {
  const result = await apiGet<UserProfileResponse>(`/api/v1/users/${userId}`);
  return result.data;
}

/** Update allowed fields on a user profile. */
export async function updateUserProfile(
  userId: string,
  changes: UpdateProfilePayload,
): Promise<BackendUserProfile> {
  const result = await apiPatch<UserProfileResponse>(`/api/v1/users/${userId}`, changes);
  return result.data;
}
