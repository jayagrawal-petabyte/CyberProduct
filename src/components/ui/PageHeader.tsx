/**
 * BrainMint PageHeader & Breadcrumb Components
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React from 'react';
import type { BreadcrumbItem } from '../../types/ui';
import { Breadcrumb } from './Breadcrumb';

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  className = '',
  style,
}) => {
  return (
    <div
      className={`brainmint-page-header ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        marginBottom: '1.75rem',
        ...style,
      }}
    >
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-3xl, 1.875rem)',
              fontWeight: 'var(--font-weight-bold, 700)',
              color: 'var(--color-text-primary, #1e1229)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontSize: 'var(--font-size-base, 0.875rem)',
                color: 'var(--color-text-secondary, #6f5d6b)',
                marginTop: '0.375rem',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexShrink: 0,
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
