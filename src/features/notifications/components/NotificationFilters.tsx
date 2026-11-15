/**
 * BrainMint NotificationFilters Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Renders the horizontal tab bar above the inbox card:
 * All notifications | Unread (n) | Access | Security | Policies
 */

import React from 'react';
import type { NotificationFilterTab } from '../types/notification.types';

interface Tab {
  id: NotificationFilterTab;
  label: string;
}

const TABS: Tab[] = [
  { id: 'all', label: 'All notifications' },
  { id: 'unread', label: 'Unread' },
  { id: 'access', label: 'Access' },
  { id: 'security', label: 'Security' },
  { id: 'policies', label: 'Policies' },
];

export interface NotificationFiltersProps {
  activeTab: NotificationFilterTab;
  onTabChange: (tab: NotificationFilterTab) => void;
  unreadCount: number;
  className?: string;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  activeTab,
  onTabChange,
  unreadCount,
  className = '',
}) => (
  <nav
    className={`notif-tabs ${className}`}
    aria-label="Notification filters"
    role="tablist"
    style={{
      display: 'flex',
      gap: 0,
      borderBottom: '1px solid var(--color-border-subtle, #f0dfe6)',
      marginBottom: '1.25rem',
    }}
  >
    {TABS.map((tab) => {
      const isActive = tab.id === activeTab;
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onTabChange(tab.id)}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-sm, 0.8125rem)',
            fontWeight: isActive
              ? 'var(--font-weight-semibold, 600)'
              : 'var(--font-weight-normal, 400)',
            color: isActive
              ? 'var(--color-info-text, #4f46e5)'
              : 'var(--color-text-secondary, #6f5d6b)',
            background: 'none',
            border: 'none',
            borderBottom: isActive
              ? '2px solid var(--color-info-text, #4f46e5)'
              : '2px solid transparent',
            padding: '0.5rem 0.875rem',
            marginBottom: '-1px',
            cursor: 'pointer',
            transition: 'color var(--transition-fast), border-color var(--transition-fast)',
            whiteSpace: 'nowrap',
          }}
        >
          {tab.label}
          {tab.id === 'unread' && unreadCount > 0 && (
            <span
              aria-label={`${unreadCount} unread`}
              style={{ marginLeft: '0.25rem', color: 'inherit' }}
            >
              ({unreadCount})
            </span>
          )}
        </button>
      );
    })}
  </nav>
);
