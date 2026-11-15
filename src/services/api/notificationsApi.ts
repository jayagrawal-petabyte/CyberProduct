/**
 * BrainMint Notifications API Service
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Service layer for the in-app notification system.
 * Communicates with real backend endpoints:
 *   GET  /api/v1/notifications            → { success, data, unreadCount }
 *   PATCH /api/v1/notifications/:id/read  → marks single notification read
 *   POST /api/v1/notifications/mark-all-read → { markedCount }
 *
 * Falls back gracefully: on API error the hook retains whatever state it has.
 */

import { apiGet, apiPatch, apiPost } from './apiClient';
import type { NotificationItem, NotificationType } from '../../features/notifications/types/notification.types';
import type { UserRole } from '../../features/auth/types/auth.types';

/** Indicates the current data source for display in development UIs */
export const notificationsDataSource = 'live backend API';

interface BackendNotification {
  id: string;
  title: string;
  message: string;
  body?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: NotificationType;
  event_type?: string;
  channel?: string;
  related_type?: string;
  related_id?: string;
  targetRoles?: UserRole[];
  targetUserId?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationsResponse {
  success: boolean;
  data: BackendNotification[];
  unreadCount: number;
}

/**
 * Fetches notifications for the authenticated user.
 * The `role` parameter is kept for API compatibility with the hook signature
 * but backend filtering is done server-side by the authenticated user's role.
 */
export async function listNotifications(_role: UserRole): Promise<NotificationItem[]> {
  const result = await apiGet<NotificationsResponse>('/api/v1/notifications');
  const items = result.data ?? [];
  return items.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message || n.body || '',
    timestamp: n.timestamp,
    isRead: n.isRead,
    priority: n.priority,
    type: n.type,
    targetRoles: n.targetRoles ?? [],
    targetUserId: n.targetUserId,
    actionUrl: n.actionUrl,
    actionLabel: n.actionLabel,
    metadata: {
      event_type: n.event_type,
      channel: n.channel,
      related_type: n.related_type,
      related_id: n.related_id,
      ...n.metadata,
    },
  }));
}

/**
 * Marks a single notification as read by id.
 */
export async function apiMarkNotificationRead(id: string): Promise<void> {
  await apiPatch(`/api/v1/notifications/${id}/read`, {});
}

/**
 * Marks all notifications for the current user as read.
 * Returns the count of notifications marked.
 */
export async function apiMarkAllNotificationsRead(): Promise<void> {
  await apiPost('/api/v1/notifications/mark-all-read', {});
}
