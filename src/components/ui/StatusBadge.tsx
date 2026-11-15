/**
 * BrainMint StatusBadge Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Renders consistent status pills with color-coded dot indicators matching Figma designs:
 * - Approved / Active / Compliant / Enabled / Satisfied (Green)
 * - Pending / Awaiting / Update available / Attention (Amber/Orange)
 * - Rejected / Non-compliant (Red)
 * - Acknowledged / Inactive / Info (Purple/Blue)
 */

import React from 'react';
import type { StatusVariant } from '../../types/ui';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusVariant | string;
  label?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showDot = true,
  size = 'md',
  className = '',
  style,
  ...rest
}) => {
  const normalized = status.toLowerCase();

  // Status mapping
  const isSuccess = [
    'approved',
    'active',
    'compliant',
    'enabled',
    'satisfied',
  ].includes(normalized);

  const isWarning = [
    'pending',
    'awaiting',
    'update available',
    'attention',
    'needs attention',
  ].includes(normalized);

  const isDanger = [
    'rejected',
    'non-compliant',
    'critical',
    'failed',
    'inactive',
  ].includes(normalized);

  let bg = 'var(--color-info-bg, #f3f0ff)';
  let border = 'var(--color-info-border, #e4ddfe)';
  let textColor = 'var(--color-info-text, #4f46e5)';
  let dotColor = 'var(--color-info, #6366f1)';

  if (isSuccess) {
    bg = 'var(--color-success-bg, #ebf9f1)';
    border = 'var(--color-success-border, #d1f2de)';
    textColor = 'var(--color-success-text, #059669)';
    dotColor = 'var(--color-success, #10b981)';
  } else if (isWarning) {
    bg = 'var(--color-warning-bg, #fef7ed)';
    border = 'var(--color-warning-border, #fce7c9)';
    textColor = 'var(--color-warning-text, #b45309)';
    dotColor = 'var(--color-warning, #f59e0b)';
  } else if (isDanger) {
    bg = 'var(--color-danger-bg, #fdf2f2)';
    border = 'var(--color-danger-border, #f8d7da)';
    textColor = 'var(--color-danger-text, #b91c1c)';
    dotColor = 'var(--color-danger, #ef4444)';
  }

  // Display text: either provided label, or capitalised status
  const displayText =
    label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`brainmint-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: size === 'sm' ? '0.125rem 0.5rem' : '0.25rem 0.625rem',
        fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
        fontWeight: 'var(--font-weight-semibold, 600)',
        fontFamily: 'var(--font-sans)',
        color: textColor,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-pill, 9999px)',
        userSelect: 'none',
        lineHeight: 1.2,
        ...style,
      }}
      {...rest}
    >
      {showDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            flexShrink: 0,
          }}
        />
      )}
      <span>{displayText}</span>
    </span>
  );
};
