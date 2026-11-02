/**
 * BrainMint EmptyState & ErrorState Components
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  style,
}) => {
  return (
    <div
      className={`brainmint-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        borderRadius: 'var(--radius-xl, 20px)',
        backgroundColor: 'var(--color-bg-card-subtle, #fff8fa)',
        border: '1px dashed var(--color-border-default, #e6d5dc)',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent-pink, #f4dee5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-brand-primary, #281a3c)',
          marginBottom: '1rem',
        }}
      >
        {icon || <Icon name="file-text" size={24} />}
      </div>

      <h3
        style={{
          fontSize: 'var(--font-size-md, 1rem)',
          fontWeight: 'var(--font-weight-bold, 700)',
          color: 'var(--color-text-primary, #1e1229)',
          marginBottom: '0.375rem',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: 'var(--font-size-sm, 0.8125rem)',
            color: 'var(--color-text-secondary, #6f5d6b)',
            maxWidth: '380px',
            marginBottom: action ? '1.25rem' : 0,
          }}
        >
          {description}
        </p>
      )}

      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'An error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
  style,
}) => {
  return (
    <div
      className={`brainmint-error-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        borderRadius: 'var(--radius-xl, 20px)',
        backgroundColor: 'var(--color-danger-bg, #fdf2f2)',
        border: '1px solid var(--color-danger-border, #f8d7da)',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-danger, #ef4444)',
          marginBottom: '1rem',
        }}
      >
        <Icon name="alert-triangle" size={26} />
      </div>

      <h3
        style={{
          fontSize: 'var(--font-size-md, 1rem)',
          fontWeight: 'var(--font-weight-bold, 700)',
          color: 'var(--color-danger-text, #b91c1c)',
          marginBottom: '0.375rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 'var(--font-size-sm, 0.8125rem)',
          color: 'var(--color-text-secondary, #6f5d6b)',
          maxWidth: '400px',
          marginBottom: onRetry ? '1.25rem' : 0,
        }}
      >
        {description}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<Icon name="refresh" size={14} />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
