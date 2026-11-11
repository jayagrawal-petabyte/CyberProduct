/**
 * BrainMint Notifications Feature — Barrel Export
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

// Page
export { default as NotificationsPage } from './pages/NotificationsPage';

// Components
export { NotificationCard }     from './components/NotificationCard';
export { NotificationFilters }  from './components/NotificationFilters';
export { NotificationList }     from './components/NotificationList';
export { NotificationBellBadge } from './components/NotificationBellBadge';

// Hook
export { useNotifications }     from './hooks/useNotifications';

// Types
export type {
  NotificationItem,
  NotificationType,
  NotificationPriority,
  NotificationFilterTab,
} from './types/notification.types';
