/**
 * BrainMint Breadcrumb Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React from 'react';
import type { BreadcrumbItem } from '../../types/ui';
import { Icon } from './Icon';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  style?: React.CSSProperties;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
  style,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`brainmint-breadcrumb ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontSize: 'var(--font-size-xs, 0.75rem)',
        color: 'var(--color-text-secondary, #6f5d6b)',
        marginBottom: '0.5rem',
        ...style,
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  color: 'var(--color-text-muted, #9e8c96)',
                }}
              >
                <Icon name="chevron-right" size={12} />
              </span>
            )}
            {isLast || !item.href ? (
              <span
                style={{
                  fontWeight: isLast
                    ? 'var(--font-weight-semibold, 600)'
                    : 'var(--font-weight-normal, 400)',
                  color: isLast
                    ? 'var(--color-text-primary, #1e1229)'
                    : 'var(--color-text-secondary, #6f5d6b)',
                }}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                style={{
                  color: 'var(--color-text-secondary, #6f5d6b)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-brand-primary, #281a3c)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-secondary, #6f5d6b)';
                }}
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
