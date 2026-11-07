import type { AccessRequest } from '../types/accessRequest.types';

export const STORAGE_KEY = 'cyberproduct_employee_access_requests';

export const DEFAULT_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: 'AR-2048',
    resource: 'Snowflake Analytics',
    access: 'Read-only · 7 days',
    submitted: '04 Nov 2026',
    updated: 'Today, 09:18',
    status: 'Pending',
  },
  {
    id: 'AR-2047',
    resource: 'GitHub Repository',
    access: 'Contributor · 7 days',
    submitted: '23 Oct 2026',
    updated: '23 Oct, 14:10',
    status: 'Approved',
  },
  {
    id: 'AR-2039',
    resource: 'Looker',
    access: 'Viewer · 90 days',
    submitted: '21 Oct 2026',
    updated: '21 Oct, 11:05',
    status: 'Approved',
  },
  {
    id: 'AR-2035',
    resource: 'AWS Console',
    access: 'Administrator · 30 days',
    submitted: '18 Oct 2026',
    updated: '19 Oct, 10:30',
    status: 'Rejected',
  },
];

export function getStoredRequests(): AccessRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as AccessRequest[];
      }
    }
  } catch {
    // Fall back to default mock requests if storage access or parsing fails
  }

  // Seed default requests into localStorage on initial access
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCESS_REQUESTS));
  } catch {
    // Ignore storage quota / security errors
  }

  return [...DEFAULT_ACCESS_REQUESTS];
}

export function saveStoredRequests(requests: AccessRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch {
    // Ignore storage quota / security errors
  }
}

function generateNextRequestId(existing: AccessRequest[]): string {
  let maxId = 2048;
  for (const item of existing) {
    const match = item.id.match(/^AR-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!Number.isNaN(num) && num > maxId) {
        maxId = num;
      }
    }
  }
  return `AR-${maxId + 1}`;
}

function formatSubmittedDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatUpdatedTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `Today, ${hours}:${minutes}`;
}

export interface CreateAccessRequestInput {
  resource: string;
  accessLevel: string;
  duration: string;
  businessReason?: string;
  additionalDetails?: string;
}

export function addAccessRequest(input: CreateAccessRequestInput): AccessRequest {
  const currentRequests = getStoredRequests();
  const nextId = generateNextRequestId(currentRequests);

  const newRequest: AccessRequest = {
    id: nextId,
    resource: input.resource,
    access: `${input.accessLevel} · ${input.duration}`,
    submitted: formatSubmittedDate(),
    updated: formatUpdatedTime(),
    status: 'Pending',
  };

  const updatedRequests = [newRequest, ...currentRequests];
  saveStoredRequests(updatedRequests);
  return newRequest;
}

export function cancelStoredRequest(id: string): AccessRequest[] {
  const currentRequests = getStoredRequests();
  const updatedRequests = currentRequests.filter((req) => req.id !== id);
  saveStoredRequests(updatedRequests);
  return updatedRequests;
}
