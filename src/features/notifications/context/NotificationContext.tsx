/**
 * BrainMint Shared Notification System — NotificationContext
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Realtime Notification Delivery Layer:
 * - Uses secure fetch-based streaming with HTTP Authorization: Bearer headers
 * - Strict security: ZERO access tokens or credentials in URLs or query strings
 * - Strict recipient and company tenant isolation enforced server-side
 * - Instant unread badge updates across all portals (Employee, Lead, Security Admin)
 * - Live notification prepending without page refresh
 * - Instant read/mark-all-as-read state propagation
 * - Intelligent reconnection with sync for missed events
 * - Graceful fallback to REST polling when streaming is interrupted or offline
 * - Immediate abort on logout / account switch to prevent event leakage
 * - Local storage caching per user and role to isolate state
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import type {
  NotificationItem,
  NotificationFilterTab,
} from '../types/notification.types';
import type { UserRole } from '../../auth/types/auth.types';
import { useAuth } from '../../auth/hooks/useAuth';
import { getStoredAccessToken, getApiUrl } from '../../../services/api/auth';
import {
  listNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
} from '../../../services/api/notificationsApi';

export type ConnectionMode = 'realtime' | 'polling' | 'offline';

export interface NotificationContextValue {
  /** Full unfiltered notification list (newest first) */
  rawNotifications: NotificationItem[];
  /** Filtered + sorted notification list for display based on activeFilter & searchQuery */
  notifications: NotificationItem[];
  /** Number of unread items across user's notifications */
  unreadCount: number;
  /** Loading state during fetch */
  isLoading: boolean;
  /** True once initial notifications have loaded */
  hasLoaded: boolean;
  /** Error message if any fetch failed */
  error: string | null;
  /** True if live SSE connection is active */
  isConnected: boolean;
  /** Current connection transport mode */
  connectionMode: ConnectionMode;
  /** Active filter tab (all, unread, access, security, policies) */
  activeFilter: NotificationFilterTab;
  setActiveFilter: (tab: NotificationFilterTab) => void;
  /** Search query string */
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  /** Marks a specific notification as read */
  markAsRead: (id: string) => Promise<void>;
  /** Marks all notifications as read */
  markAllAsRead: () => Promise<void>;
  /** Dismisses / deletes a notification */
  deleteNotification: (id: string) => void;
  /** Manually refresh notifications from backend */
  refresh: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

/** Namespace key: isolates notifications per role + user so users never see each other's state */
export function getStorageKey(role: UserRole, userId: string): string {
  return `cyberproduct_notifications_${role}_${userId}`;
}

export function readFromStorage(key: string): NotificationItem[] {
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

export function writeToStorage(key: string, items: NotificationItem[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* ignore storage quota / security errors */
  }
}

/**
 * Parses raw SSE chunk buffer into structured messages.
 */
export function parseSSEBuffer(buffer: string): {
  messages: Array<{ event: string; data: string }>;
  remaining: string;
} {
  const messages: Array<{ event: string; data: string }> = [];
  const normalized = buffer.replace(/\r\n/g, '\n');
  const parts = normalized.split('\n\n');
  const remaining = parts.pop() ?? '';

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed || trimmed.startsWith(':')) continue;

    let event = 'message';
    let data = '';
    const lines = part.split('\n');

    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const value = line.slice(5).trim();
        data = data ? `${data}\n${value}` : value;
      }
    }

    if (data) {
      messages.push({ event, data });
    }
  }

  return { messages, remaining };
}

export interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id || '';
  const role = user?.role || 'employee';

  const key = useMemo(() => {
    return userId ? getStorageKey(role, userId) : '';
  }, [role, userId]);

  const [rawNotifications, setRawNotifications] = useState<NotificationItem[]>(() => {
    return key ? readFromStorage(key) : [];
  });
  const [hasLoaded, setHasLoaded] = useState(() => {
    return key ? readFromStorage(key).length > 0 : false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('offline');

  const [activeFilter, setActiveFilter] = useState<NotificationFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  /** Persist notifications state to memory and storage */
  const persist = useCallback(
    (updater: (prev: NotificationItem[]) => NotificationItem[]) => {
      setRawNotifications((prev) => {
        const next = updater(prev);
        if (key) {
          writeToStorage(key, next);
        }
        return next;
      });
    },
    [key],
  );

  /**
   * Fetches fresh notifications from backend and reconciles read state.
   */
  const refresh = useCallback(async () => {
    if (!isAuthenticated || !userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await listNotifications(role);
      persist((prev) => {
        const readIds = new Set(prev.filter((n) => n.isRead).map((n) => n.id));
        const merged = loaded.map((n) => ({
          ...n,
          isRead: readIds.has(n.id) ? true : n.isRead,
        }));
        const loadedIds = new Set(loaded.map((n) => n.id));
        const unreturned = prev.filter((n) => !loadedIds.has(n.id));
        return [...unreturned, ...merged].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
      });
      setHasLoaded(true);
    } catch {
      setError('Could not load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, role, persist]);

  /** Marks a single notification as read */
  const markAsRead = useCallback(
    async (id: string) => {
      persist((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      try {
        await apiMarkNotificationRead(id);
      } catch {
        /* optimistic state remains */
      }
    },
    [persist],
  );

  /** Marks all notifications as read */
  const markAllAsRead = useCallback(async () => {
    persist((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiMarkAllNotificationsRead();
    } catch {
      /* optimistic state remains */
    }
  }, [persist]);

  /** Deletes/dismisses a notification */
  const deleteNotification = useCallback(
    (id: string) => {
      persist((prev) => prev.filter((n) => n.id !== id));
    },
    [persist],
  );

  /**
   * Dispatches parsed SSE event payloads.
   */
  const handleSSEEvent = useCallback(
    (event: string, rawData: string) => {
      try {
        const data = JSON.parse(rawData);

        if (event === 'connected') {
          setIsConnected(true);
          setConnectionMode('realtime');
          return;
        }

        if (event === 'notification' && data?.notification) {
          const rawItem = data.notification;
          const newItem: NotificationItem = {
            id: rawItem.id,
            title: rawItem.title,
            message: rawItem.message || rawItem.body || '',
            timestamp: rawItem.timestamp || rawItem.created_at || new Date().toISOString(),
            isRead: Boolean(rawItem.isRead || rawItem.read_at),
            priority: rawItem.priority || 'medium',
            type: rawItem.type || 'system',
            targetRoles: rawItem.targetRoles || (role ? [role] : []),
            targetUserId: rawItem.targetUserId || userId,
            actionUrl: rawItem.actionUrl,
            actionLabel: rawItem.actionLabel,
            metadata: rawItem.metadata,
          };

          persist((prev) => {
            // Deduplicate by ID
            if (prev.some((n) => n.id === newItem.id)) {
              return prev;
            }
            return [newItem, ...prev];
          });
        }

        if (event === 'read') {
          if (data?.all) {
            persist((prev) => prev.map((n) => ({ ...n, isRead: true })));
          } else if (data?.notificationId) {
            persist((prev) =>
              prev.map((n) => (n.id === data.notificationId ? { ...n, isRead: true } : n)),
            );
          }
        }
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    },
    [role, userId, persist],
  );

  // Secure Fetch-based Realtime Streaming
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      setIsConnected(false);
      setConnectionMode('offline');
      setRawNotifications([]);
      return;
    }

    // Initial sync
    void refresh();

    const abortController = new AbortController();
    let isTerminated = false;

    async function streamLoop() {
      while (!isTerminated) {
        const token = getStoredAccessToken();
        if (!token) {
          setIsConnected(false);
          setConnectionMode('polling');
          break;
        }

        try {
          // Zero tokens in URL: Token sent securely via HTTP Authorization header
          const streamUrl = getApiUrl('/api/v1/notifications/stream');
          const response = await fetch(streamUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'text/event-stream',
            },
            signal: abortController.signal,
          });

          if (response.status === 401) {
            // Token expired or revoked — stop streaming immediately
            setIsConnected(false);
            setConnectionMode('offline');
            break;
          }

          if (!response.ok || !response.body) {
            throw new Error(`SSE stream failed with status ${response.status}`);
          }

          setIsConnected(true);
          setConnectionMode('realtime');

          // Clean up polling timer if it was active
          if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
          }

          // Re-sync missed notifications on reconnect
          void refresh();

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (!isTerminated) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const { messages, remaining } = parseSSEBuffer(buffer);
            buffer = remaining;

            for (const msg of messages) {
              handleSSEEvent(msg.event, msg.data);
            }
          }
        } catch (err: unknown) {
          if (isTerminated || (err instanceof Error && err.name === 'AbortError')) {
            break;
          }
          setIsConnected(false);
          setConnectionMode('polling');

          // Fallback polling while disconnected
          if (!pollingTimerRef.current) {
            pollingTimerRef.current = setInterval(() => {
              void refresh();
            }, 25000);
          }

          // Wait 3s before retrying stream
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }

    void streamLoop();

    return () => {
      isTerminated = true;
      abortController.abort();
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [isAuthenticated, userId, refresh, handleSSEEvent]);

  const unreadCount = useMemo(() => {
    return rawNotifications.filter((n) => !n.isRead).length;
  }, [rawNotifications]);

  const filteredNotifications = useMemo(() => {
    let result = [...rawNotifications];

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
  }, [rawNotifications, activeFilter, searchQuery]);

  const value: NotificationContextValue = {
    rawNotifications,
    notifications: filteredNotifications,
    unreadCount,
    isLoading,
    hasLoaded,
    error,
    isConnected,
    connectionMode,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
