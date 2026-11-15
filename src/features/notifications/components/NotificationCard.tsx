/**
 * BrainMint NotificationCard Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Renders a single notification item inside the Inbox card.
 * - Priority-based icon and unread dot colour
 * - Formatted relative timestamp (Today / N days ago)
 * - Action deep-link
 * - Hover-reveal "mark as read" button
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import type { NotificationItem } from '../types/notification.types';
import type { IconName } from '../../../types/ui';
import './NotificationCard.css';

/** Format ISO timestamp → "Today, 09:18"  or  "23 Oct, 14:10" */
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const itemMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const HH = date.getHours().toString().padStart(2, '0');
  const MM = date.getMinutes().toString().padStart(2, '0');
  const time = `${HH}:${MM}`;

  if (itemMidnight.getTime() === todayMidnight.getTime()) {
    return `Today, ${time}`;
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}, ${time}`;
}

/** Selects the left-side icon based on type + priority */
function getIcon(item: NotificationItem): IconName {
  if (item.type === 'security') return 'alert-triangle';
  if (item.priority === 'high' || item.priority === 'critical') return 'alert-triangle';
  if (item.type === 'policies') return 'shield-check';
  if (item.type === 'device') return 'monitor';
  return 'bell';
}

/** Readable category label shown in meta line */
function categoryLabel(type: NotificationItem['type']): string {
  const labels: Record<NotificationItem['type'], string> = {
    access: 'Access',
    security: 'Security',
    policies: 'Policy',
    device: 'Device',
    system: 'Audit',
  };
  return labels[type] ?? 'System';
}

export interface NotificationCardProps {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
  onDelete,
}) => {
  const icon = getIcon(notification);
  const isWarning = icon === 'alert-triangle';
  const dotColour = (notification.priority === 'high' || notification.priority === 'critical')
    ? 'warning'
    : 'info';

  const handleCardClick = () => {
    if (!notification.isRead) onMarkRead(notification.id);
  };

  const handleMarkReadBtn = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  return (
    <article
      className={`notif-card${notification.isRead ? '' : ' notif-card--unread'}`}
      onClick={handleCardClick}
      role={notification.isRead ? undefined : 'button'}
      tabIndex={notification.isRead ? undefined : 0}
      onKeyDown={(e) => { if (!notification.isRead && (e.key === 'Enter' || e.key === ' ')) handleCardClick(); }}
      aria-label={notification.isRead ? notification.title : `Unread: ${notification.title}`}
    >
      {/* Left icon */}
      <div className={`notif-card__icon notif-card__icon--${isWarning ? 'warning' : notification.type}`} aria-hidden="true">
        <Icon name={icon} size={18} strokeWidth={1.8} />
      </div>

      {/* Body */}
      <div className="notif-card__body">
        <div className="notif-card__title-row">
          {!notification.isRead && (
            <span className={`notif-card__dot notif-card__dot--${dotColour}`} aria-hidden="true" />
          )}
          <span className="notif-card__title">{notification.title}</span>
        </div>
        <p className="notif-card__message">{notification.message}</p>
        <p className="notif-card__meta">
          {categoryLabel(notification.type)} · {formatTimestamp(notification.timestamp)}
        </p>
        {notification.actionUrl && notification.actionLabel && (
          <Link
            to={notification.actionUrl}
            className="notif-card__action"
            onClick={(e) => e.stopPropagation()}
          >
            {notification.actionLabel} →
          </Link>
        )}
      </div>

      {/* Hover controls */}
      <div className="notif-card__controls">
        {!notification.isRead && (
          <button
            type="button"
            className="notif-card__ctrl-btn"
            onClick={handleMarkReadBtn}
            title="Mark as read"
            aria-label="Mark as read"
          >
            <Icon name="check" size={13} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="notif-card__ctrl-btn notif-card__ctrl-btn--delete"
            onClick={handleDelete}
            title="Dismiss"
            aria-label="Dismiss notification"
          >
            <Icon name="x" size={13} />
          </button>
        )}
      </div>
    </article>
  );
};
