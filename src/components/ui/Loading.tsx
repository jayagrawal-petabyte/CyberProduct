/**
 * BrainMint Loading & Skeleton State Components
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React from 'react';
import type { ComponentSize } from '../../types/ui';

export interface LoadingSpinnerProps {
  size?: ComponentSize;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'var(--color-brand-primary, #281a3c)',
  className = '',
  style,
}) => {
  const dimensions = {
    sm: 16,
    md: 24,
    lg: 36,
  };

  const dim = dimensions[size];

  return (
    <span
      className={`brainmint-spinner ${className}`}
      style={{
        display: 'inline-block',
        width: `${dim}px`,
        height: `${dim}px`,
        border: `2.5px solid ${color}`,
        borderRightColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
        ...style,
      }}
    />
  );
};

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm, 8px)',
  className = '',
  style,
  ...rest
}) => {
  return (
    <div
      className={`brainmint-skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        backgroundColor: 'var(--color-accent-pink, #f4dee5)',
        opacity: 0.65,
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
      {...rest}
    />
  );
};

export const CardSkeleton: React.FC<{ height?: number }> = ({ height = 180 }) => (
  <div
    style={{
      backgroundColor: 'var(--color-bg-card, #ffffff)',
      border: '1px solid var(--color-border-subtle, #f0dfe6)',
      borderRadius: 'var(--radius-xl, 20px)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      height: `${height}px`,
    }}
  >
    <Skeleton width="40%" height="20px" />
    <Skeleton width="90%" height="16px" />
    <Skeleton width="75%" height="16px" />
    <div style={{ marginTop: 'auto' }}>
      <Skeleton width="30%" height="32px" borderRadius="12px" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div
    style={{
      backgroundColor: 'var(--color-bg-card, #ffffff)',
      border: '1px solid var(--color-border-subtle, #f0dfe6)',
      borderRadius: 'var(--radius-xl, 20px)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
    }}
  >
    <Skeleton width="30%" height="24px" style={{ marginBottom: '0.5rem' }} />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Skeleton width="36px" height="36px" borderRadius="50%" />
        <Skeleton width="25%" height="16px" />
        <Skeleton width="35%" height="16px" />
        <Skeleton width="15%" height="22px" borderRadius="9999px" />
        <Skeleton width="10%" height="30px" borderRadius="8px" style={{ marginLeft: 'auto' }} />
      </div>
    ))}
  </div>
);
