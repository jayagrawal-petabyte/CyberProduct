/**
 * BrainMint Notifications API Service
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Service layer for the in-app notification system.
 * All operations are currently MOCK-BASED (no real backend endpoint exists).
 *
 * When VITE_API_URL is configured and the backend /api/notifications
 * endpoint is ready, uncomment the fetch() calls and remove mock fallbacks.
 *
 * API CONTRACT (future):
 *   GET  /api/notifications         → NotificationItem[]
 *   PATCH /api/notifications/:id/read → void
 *   POST /api/notifications/mark-all-read → void
 */

import { MOCK_NOTIFICATIONS } from '../../features/notifications/data/mockNotifications';
import type { NotificationItem } from '../../features/notifications/types/notification.types';
import type { UserRole } from '../../features/auth/types/auth.types';

/** Indicates the current data source for display in development UIs */
export const notificationsDataSource = 'development mock data';

/**
 * Fetches notifications for the given role.
 *
 * MOCK: Returns role-filtered records from MOCK_NOTIFICATIONS with a
 * simulated 300ms network delay.
 *
 * FUTURE (backend ready):
 *   const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
 *     credentials: 'include',
 *   });
 *   return res.json() as Promise<NotificationItem[]>;
 */
export async function listNotifications(role: UserRole): Promise<NotificationItem[]> {
  await new Promise<void>((resolve) => window.setTimeout(resolve, 300));
  return MOCK_NOTIFICATIONS.filter((n) => n.targetRoles.includes(role)).map((n) => ({ ...n }));
}

/**
 * Marks a single notification as read by id.
 *
 * MOCK: No-op — read state is persisted locally in the hook via localStorage.
 *
 * FUTURE (backend ready):
 *   await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`, {
 *     method: 'PATCH',
 *     credentials: 'include',
 *   });
 */
export async function apiMarkNotificationRead(id: string): Promise<void> {
  // No-op in mock mode — localStorage handles persistence
  void id;
  await Promise.resolve();
}

/**
 * Marks all notifications for the current user as read.
 *
 * MOCK: No-op — read state is persisted locally in the hook via localStorage.
 *
 * FUTURE (backend ready):
 *   await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`, {
 *     method: 'POST',
 *     credentials: 'include',
 *   });
 */
export async function apiMarkAllNotificationsRead(): Promise<void> {
  // No-op in mock mode — localStorage handles persistence
  await Promise.resolve();
}
