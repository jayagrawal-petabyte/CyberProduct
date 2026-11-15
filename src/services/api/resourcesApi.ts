/**
 * BrainMint Resources API Service
 * CyberProduct Platform
 *
 * Communicates with GET /api/v1/resources and GET /api/v1/resources/categories
 * Used by the Request Access page to populate the resource selector.
 */

import { apiGet } from './apiClient';

export interface BackendResource {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  category: string | null;
  resource_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ResourceListResponse {
  success: boolean;
  data: BackendResource[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

interface ResourceSingleResponse {
  success: boolean;
  data: BackendResource;
}

/** Fetch all resources available in the authenticated user's company. */
export async function getResources(): Promise<BackendResource[]> {
  const result = await apiGet<ResourceListResponse>('/api/v1/resources');
  return result.data ?? [];
}

/** Fetch a single resource by ID. */
export async function getResourceById(id: string): Promise<BackendResource> {
  const result = await apiGet<ResourceSingleResponse>(`/api/v1/resources/${id}`);
  return result.data;
}
