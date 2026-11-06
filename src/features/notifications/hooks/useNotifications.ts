/**
 * BrainMint Shared Notification System — useNotifications Hook
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Manages notification state with:
 * - Role-filtered data loading from mock/API
 * - localStorage persistence of read/unread state across navigation
 * - Tab filtering (all, unread, access, security, policies) + search
 * - Per-user, per-role storage isolation to prevent state leakage
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { NotificationItem, NotificationFilterTab } from '../types/notification.types';
import type { UserRole } from '../../auth/types/auth.types';
import {
  listNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
} from '../../../services/api/notificationsApi';

/** Namespace key: isolates notifications per role + user so users never see each other's state */
function storageKey(role: UserRole, userId: string): string {
  return `cyberproduct_notifications_${role}_${userId}`;
}

function readFromStorage(key: string): NotificationItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as NotificationItem[];
    }
  } catch {
    /* ignore parse / storage errors */
  }
  return [];
}

function writeToStorage(key: string, items: NotificationItem[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* ignore storage quota / security errors */
  }
}

export interface UseNotificationsReturn {
  /** Filtered + sorted notification list for display */
  notifications: NotificationItem[];
  /** Number of unread items in the full (pre-filter) list */
  unreadCount: number;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  activeFilter: NotificationFilterTab;
  setActiveFilter: (tab: NotificationFilterTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => void;
  refresh: () => Promise<void>;
}

export function useNotifications(role: UserRole, userId: string): UseNotificationsReturn {
  const key = storageKey(role, userId);

  // Initialise from localStorage so read-states survive navigation
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    readFromStorage(key),
  );
  const [hasLoaded, setHasLoaded] = useState(() => readFromStorage(key).length > 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<NotificationFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  /** Persist to both React state and localStorage atomically */
  const persist = useCallback(
    (updater: (prev: NotificationItem[]) => NotificationItem[]) => {
      setNotifications((prev) => {
        const next = updater(prev);
        writeToStorage(key, next);
        return next;
      });
    },
    [key],
  );

  /**
   * Fetches fresh data from the API (or mock) and merges with stored read-states.
   * Skips the loading skeleton when cached data is already present.
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await listNotifications(role);
      persist((prev) => {
        // Preserve existing read states so a refresh doesn't reset the inbox
        const readIds = new Set(prev.filter((n) => n.isRead).map((n) => n.id));
        return loaded.map((n) => ({ ...n, isRead: readIds.has(n.id) ? true : n.isRead }));
      });
      setHasLoaded(true);
    } catch {
      setError('Could not load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [role, persist]);

  // Load data on mount — silent if localStorage already has content
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentional: run only once on mount to load initial data

  /** Marks a single item read and fires the API call (no-op in mock mode). */
  const markAsRead = useCallback(
    async (id: string) => {
      persist((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      try {
        await apiMarkNotificationRead(id);
      } catch {
        /* ignore — state already updated locally */
      }
    },
    [persist],
  );

  /** Marks all items read and fires the API call (no-op in mock mode). */
  const markAllAsRead = useCallback(async () => {
    persist((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiMarkAllNotificationsRead();
    } catch {
      /* ignore — state already updated locally */
    }
  }, [persist]);

  /** Removes a single notification from the list (dismiss). */
  const deleteNotification = useCallback(
    (id: string) => {
      persist((prev) => prev.filter((n) => n.id !== id));
    },
    [persist],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    switch (activeFilter) {
      case 'unread':
        result = result.filter((n) => !n.isRead);
        break;
      case 'access':
        result = result.filter((n) => n.type === 'access');
        break;
      case 'security':
        result = result.filter((n) => n.type === 'security');
        break;
      case 'policies':
        result = result.filter((n) => n.type === 'policies');
        break;
      default:
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q),
      );
    }

    // Newest first
    return result.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [notifications, activeFilter, searchQuery]);

  return {
    notifications: filteredNotifications,
    unreadCount,
    isLoading,
    hasLoaded,
    error,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}
