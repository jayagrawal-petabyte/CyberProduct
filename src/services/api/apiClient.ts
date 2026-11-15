/**
 * BrainMint API Client
 * CyberProduct Platform
 *
 * Thin fetch wrapper that:
 * - Automatically injects Authorization: Bearer <token> header
 * - Uses proxy-relative paths (Vite proxy → http://localhost:3000)
 * - Returns typed { success, data, message } envelopes
 * - On 401: clears session storage (caller handles redirect)
 */

import { getStoredAccessToken, clearAuthSession, getApiUrl } from './auth';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiOptions extends Omit<RequestInit, 'headers'> {
  token?: string | null;
  headers?: Record<string, string>;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, headers = {}, ...rest } = options;
  const authToken = token ?? getStoredAccessToken();
  const url = getApiUrl(path);

  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  // 401 → wipe session so the auth context can redirect to login
  if (response.status === 401) {
    clearAuthSession();
    throw new ApiError(401, 'Session expired. Please log in again.');
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(response.status, 'Invalid JSON response from server');
  }

  if (!response.ok) {
    const msg =
      (data as { message?: string } | null)?.message ??
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, msg, data);
  }

  return data as T;
}

/** GET helper */
export function apiGet<T = unknown>(path: string, token?: string | null): Promise<T> {
  return apiRequest<T>(path, { method: 'GET', token });
}

/** POST helper */
export function apiPost<T = unknown>(
  path: string,
  body: unknown,
  token?: string | null,
): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

/** PATCH helper */
export function apiPatch<T = unknown>(
  path: string,
  body: unknown,
  token?: string | null,
): Promise<T> {
  return apiRequest<T>(path, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}
