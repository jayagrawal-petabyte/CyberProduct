/**
 * BrainMint Toast Notification Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React from 'react';
import type { ToastVariant } from '../../types/ui';
import { Icon } from './Icon';

export interface ToastProps {
  id?: string;
  variant?: ToastVariant;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Toast: React.FC<ToastProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  className = '',
  style,
}) => {
  const variantIcons: Record<ToastVariant, 'check-circle' | 'alert-triangle' | 'x-circle' | 'bell'> = {
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'x-circle',
    info: 'bell',
  };

  const variantColors: Record<ToastVariant, { bg: string; border: string; text: string; icon: string }> = {
    success: {
      bg: 'var(--color-success-bg, #ebf9f1)',
      border: 'var(--color-success-border, #d1f2de)',
      text: 'var(--color-success-text, #059669)',
      icon: 'var(--color-success, #10b981)',
    },
    warning: {
      bg: 'var(--color-warning-bg, #fef7ed)',
      border: 'var(--color-warning-border, #fce7c9)',
      text: 'var(--color-warning-text, #b45309)',
      icon: 'var(--color-warning, #f59e0b)',
    },
    error: {
      bg: 'var(--color-danger-bg, #fdf2f2)',
      border: 'var(--color-danger-border, #f8d7da)',
      text: 'var(--color-danger-text, #b91c1c)',
      icon: 'var(--color-danger, #ef4444)',
    },
    info: {
      bg: 'var(--color-bg-card, #ffffff)',
      border: 'var(--color-border-subtle, #f0dfe6)',
      text: 'var(--color-text-primary, #1e1229)',
      icon: 'var(--color-brand-primary, #281a3c)',
    },
  };

  const colors = variantColors[variant];

  return (
    <div
      role="alert"
      className={`brainmint-toast ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 'var(--radius-md, 12px)',
        boxShadow: 'var(--shadow-dropdown)',
        maxWidth: '420px',
        width: '100%',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          color: colors.icon,
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        <Icon name={variantIcons[variant]} size={18} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontSize: 'var(--font-size-sm, 0.8125rem)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: colors.text,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h4>
        {message && (
          <p
            style={{
              fontSize: 'var(--font-size-xs, 0.75rem)',
              color: 'var(--color-text-secondary, #6f5d6b)',
              marginTop: '0.25rem',
              lineHeight: 1.4,
            }}
          >
            {message}
          </p>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: 'var(--color-text-muted, #9e8c96)',
            display: 'inline-flex',
            flexShrink: 0,
          }}
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
};
