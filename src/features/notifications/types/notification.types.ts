/**
 * BrainMint Shared Notification System — Types
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Data model for the cross-role in-app notification system.
 * Extensible to support Employee, Team Lead, and Security role experiences.
 */

import type { UserRole } from '../../auth/types/auth.types';

/** Filtering categories — maps to inbox filter tabs */
export type NotificationType =
  | 'access'    // Access request status updates, grants, renewals
  | 'security'  // Threat alerts, blocked attempts, sign-in anomalies
  | 'policies'  // Policy acknowledgement reminders, rollout updates
  | 'device'    // Device compliance scans, non-compliant device alerts
  | 'system';   // Audit exports, identity provider sync, maintenance

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;               // ISO 8601 date-time string
  isRead: boolean;
  priority: NotificationPriority;
  type: NotificationType;
  targetRoles: UserRole[];         // Roles that should receive this notification
  targetUserId?: string;           // Optional: restrict to a specific user by id
  actionUrl?: string;              // Deep-link (e.g. '/employee/access-requests')
  actionLabel?: string;            // CTA button text (e.g. 'View request')
  metadata?: Record<string, unknown>; // Extensible payload for future backend fields
}

/** Active filter tab on the notifications inbox */
export type NotificationFilterTab = 'all' | 'unread' | 'access' | 'security' | 'policies';
