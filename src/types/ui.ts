/**
 * Shared UI component type definitions for CyberProduct (BrainMint Design System)
 * Owner: Shivam Kumar (Frontend Lead)
 */

export type ComponentSize = 'sm' | 'md' | 'lg';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export type StatusVariant =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'compliant'
  | 'attention'
  | 'enabled'
  | 'satisfied'
  | 'acknowledged';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export type IconName =
  | 'arrow-right'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'check'
  | 'check-circle'
  | 'clock'
  | 'alert-triangle'
  | 'x'
  | 'x-circle'
  | 'shield'
  | 'shield-check'
  | 'shield-alert'
  | 'monitor'
  | 'monitor-check'
  | 'devices'
  | 'smartphone'
  | 'laptop'
  | 'bell'
  | 'user'
  | 'user-circle'
  | 'users'
  | 'home'
  | 'house'
  | 'network'
  | 'clipboard-list'
  | 'clipboard-check'
  | 'bell-ring'
  | 'messages-square'
  | 'history'
  | 'approval-history'
  | 'line-chart'
  | 'chart-line'
  | 'file-check'
  | 'checklist'
  | 'key'
  | 'plus'
  | 'diamond-plus'
  | 'edit'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'search'
  | 'refresh'
  | 'external-link'
  | 'calendar'
  | 'file-text'
  | 'settings'
  | 'grid'
  | 'save';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
