/**
 * BrainMint MetricCard Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Renders the signature metric cards found on CyberProduct dashboards:
 * - Title & icon at top
 * - Large metric value & status label
 * - Subtext description
 */

import React from 'react';
import { Card } from '../ui/Card';

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  label?: string;
  subtext?: string;
  icon?: React.ReactNode;
  valueColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  label,
  subtext,
  icon,
  valueColor,
  className = '',
  style,
  ...rest
}) => {
  return (
    <Card
      className={`brainmint-metric-card ${className}`}
      padding="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '136px',
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-text-secondary, #6f5d6b)',
          }}
        >
          {title}
        </span>
        {icon && (
          <span
            style={{
              display: 'inline-flex',
              color: 'var(--color-text-secondary, #6f5d6b)',
              opacity: 0.8,
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <div style={{ marginTop: '0.625rem', marginBottom: '0.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: 'var(--font-size-2xl, 1.5rem)',
              fontWeight: 'var(--font-weight-bold, 700)',
              color: valueColor || 'var(--color-text-primary, #1e1229)',
              lineHeight: 1.1,
            }}
          >
            {value}
          </span>
          {label && (
            <span
              style={{
                fontSize: 'var(--font-size-sm, 0.8125rem)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: valueColor || 'var(--color-text-secondary, #6f5d6b)',
              }}
            >
              {label}
            </span>
          )}
        </div>
      </div>

      {subtext && (
        <span
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-text-muted, #9e8c96)',
            lineHeight: 1.3,
          }}
        >
          {subtext}
        </span>
      )}
    </Card>
  );
};
