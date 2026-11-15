/**
 * BrainMint Shared Notification System — useNotifications Hook
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Consumes global NotificationContext when mounted within NotificationProvider
 * for real-time SSE push updates, synchronized unread counts, and cross-tab/view consistency.
 *
 * Provides graceful fallback to local storage / REST API when used standalone.
 */

import { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import type { NotificationItem, NotificationFilterTab } from '../types/notification.types';
import type { UserRole } from '../../auth/types/auth.types';
import {
  NotificationContext,
  getStorageKey,
  readFromStorage,
  writeToStorage,
} from '../context/NotificationContext';
import {
  listNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
} from '../../../services/api/notificationsApi';

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

export function useNotifications(role?: UserRole, userId?: string): UseNotificationsReturn {
  const context = useContext(NotificationContext);

  // If running inside NotificationProvider, delegate to global real-time context
  if (context) {
    return {
      notifications: context.notifications,
      unreadCount: context.unreadCount,
      isLoading: context.isLoading,
      hasLoaded: context.hasLoaded,
      error: context.error,
      activeFilter: context.activeFilter,
      setActiveFilter: context.setActiveFilter,
      searchQuery: context.searchQuery,
      setSearchQuery: context.setSearchQuery,
      markAsRead: context.markAsRead,
      markAllAsRead: context.markAllAsRead,
      deleteNotification: context.deleteNotification,
      refresh: context.refresh,
    };
  }

  // Fallback standalone implementation for test environments or isolated trees
  return useStandaloneNotifications(role || 'employee', userId || 'anon');
}

/** Standalone fallback implementation */
function useStandaloneNotifications(role: UserRole, userId: string): UseNotificationsReturn {
  const key = getStorageKey(role, userId);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    readFromStorage(key),
  );
  const [hasLoaded, setHasLoaded] = useState(() => readFromStorage(key).length > 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<NotificationFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await listNotifications(role);
      persist((prev) => {
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

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markAsRead = useCallback(
    async (id: string) => {
      persist((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      try {
        await apiMarkNotificationRead(id);
      } catch {
        /* optimistic update */
      }
    },
    [persist],
  );

  const markAllAsRead = useCallback(async () => {
    persist((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiMarkAllNotificationsRead();
    } catch {
      /* optimistic update */
    }
  }, [persist]);

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
        result = result.filter((n) => n.type === 'security' || n.type === 'device');
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
