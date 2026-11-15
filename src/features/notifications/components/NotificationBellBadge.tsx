/**
 * BrainMint NotificationBellBadge Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Reusable standalone bell icon with dynamic unread counter badge.
 * Suitable for top headers, user menus, or custom navigation docks.
 */

import React from 'react';
import { Icon } from '../../../components/ui/Icon';

export interface NotificationBellBadgeProps {
  unreadCount: number;
  onClick?: () => void;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export const NotificationBellBadge: React.FC<NotificationBellBadgeProps> = ({
  unreadCount,
  onClick,
  size = 22,
  className = '',
  style,
  'aria-label': ariaLabel,
}) => {
  const label =
    ariaLabel ??
    (unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`notif-bell-badge ${className}`}
      aria-label={label}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        padding: 0,
        ...style,
      }}
    >
      <Icon name="bell" size={size} />

      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-5px',
            minWidth: '16px',
            height: '16px',
            padding: '0 3px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-danger, #ef4444)',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #ffffff',
            lineHeight: 1,
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
