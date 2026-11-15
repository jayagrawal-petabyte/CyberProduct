/**
 * BrainMint NotificationList Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Renders the notification feed inside the inbox card:
 * - Skeleton loading state (when no cached data exists)
 * - Error state with retry action
 * - Empty state via shared EmptyState component
 * - Chronological groups (Today / Earlier this week / Older)
 * - 90-day retention message footer
 */

import React from 'react';
import { Icon } from '../../../components/ui/Icon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { NotificationCard } from './NotificationCard';
import type { NotificationItem } from '../types/notification.types';

/** Groups items into Today / Earlier this week / Older buckets */
function groupByDate(
  items: NotificationItem[],
): { label: string; items: NotificationItem[] }[] {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const weekAgoMidnight = new Date(todayMidnight);
  weekAgoMidnight.setDate(weekAgoMidnight.getDate() - 7);

  const groups: { label: string; items: NotificationItem[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Earlier this week', items: [] },
    { label: 'Older', items: [] },
  ];

  for (const item of items) {
    const d = new Date(item.timestamp);
    const dMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dMidnight.getTime() >= todayMidnight.getTime()) {
      groups[0].items.push(item);
    } else if (dMidnight.getTime() >= weekAgoMidnight.getTime()) {
      groups[1].items.push(item);
    } else {
      groups[2].items.push(item);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

export interface NotificationListProps {
  notifications: NotificationItem[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  onMarkRead: (id: string) => void;
  onDelete?: (id: string) => void;
  onRetry?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  hasLoaded,
  error,
  onMarkRead,
  onDelete,
  onRetry,
}) => {
  /* ── Loading skeleton — only shown before first successful load ── */
  if (isLoading && !hasLoaded) {
    return (
      <div role="status" aria-label="Loading notifications">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '0.875rem',
              padding: '1rem 1.25rem',
              borderBottom: i < 3 ? '1px solid var(--color-border-subtle, #f0dfe6)' : 'none',
            }}
          >
            {/* Icon skeleton */}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--color-accent-pink, #f4dee5)',
                flexShrink: 0,
                marginTop: 2,
                animation: 'notif-pulse 1.4s ease-in-out infinite',
              }}
            />
            {/* Text skeleton */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div
                style={{
                  height: 14,
                  width: '60%',
                  borderRadius: 6,
                  background: 'var(--color-accent-pink, #f4dee5)',
                  animation: 'notif-pulse 1.4s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  height: 12,
                  width: '85%',
                  borderRadius: 6,
                  background: 'var(--color-accent-lavender, #eedee6)',
                  animation: 'notif-pulse 1.4s ease-in-out 0.2s infinite',
                }}
              />
              <div
                style={{
                  height: 10,
                  width: '30%',
                  borderRadius: 6,
                  background: 'var(--color-accent-lavender, #eedee6)',
                  animation: 'notif-pulse 1.4s ease-in-out 0.4s infinite',
                }}
              />
            </div>
          </div>
        ))}
        <style>{`@keyframes notif-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '1.25rem',
          color: 'var(--color-danger-text, #b91c1c)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--font-size-sm, 0.8125rem)',
        }}
      >
        <Icon name="alert-triangle" size={16} />
        <span>{error}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: '1px solid currentColor',
              borderRadius: 'var(--radius-sm, 8px)',
              padding: '0.25rem 0.625rem',
              cursor: 'pointer',
              fontSize: 'inherit',
              color: 'inherit',
            }}
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  /* ── Empty state ── */
  if (hasLoaded && notifications.length === 0) {
    return (
      <EmptyState
        icon={<Icon name="bell" size={28} />}
        title="You're all caught up"
        description="No notifications match the current filter. New notifications will appear here."
        style={{ margin: '1.5rem 0', borderRadius: 'var(--radius-lg, 16px)' }}
      />
    );
  }

  const groups = groupByDate(notifications);
  const showGroupLabels = groups.length > 1;

  return (
    <>
      {groups.map((group) => (
        <div key={group.label}>
          {showGroupLabels && (
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-xs, 0.75rem)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-text-muted, #9e8c96)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0.625rem 1.25rem 0.25rem',
                borderBottom: '1px solid var(--color-border-subtle, #f0dfe6)',
              }}
            >
              {group.label}
            </div>
          )}
          {group.items.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
            />
          ))}
        </div>
      ))}

      {/* Retention notice */}
      <p
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--font-size-xs, 0.75rem)',
          color: 'var(--color-text-muted, #9e8c96)',
          padding: '1rem',
          margin: 0,
          borderTop: '1px solid var(--color-border-subtle, #f0dfe6)',
        }}
      >
        Notifications are retained for 90 days
      </p>
    </>
  );
};
