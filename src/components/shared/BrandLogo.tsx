/**
 * BrainMint Brand Logo Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Displays the official BrainMint brand asset from public/assets/brand/brainmint-logo.png
 * with high DPI rendering, scalable height, and accessible fallback.
 */

import React, { useState } from 'react';

export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  style,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  const heights = {
    sm: 32,
    md: 46,
    lg: 60,
  };

  const height = heights[size];

  return (
    <div
      className={`brand-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
      {...rest}
    >
      {!hasError ? (
        <img
          src="/assets/brand/brainmint-logo.png"
          alt="BrainMint — Guiding You to a World of Education"
          height={height}
          style={{
            height: `${height}px`,
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
          onError={() => setHasError(true)}
        />
      ) : (
        /* Fallback if logo file fails or is missing */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <div
            style={{
              width: `${height * 0.8}px`,
              height: `${height * 0.8}px`,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #EF4444, #F59E0B, #10B981, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: `${height * 0.4}px`,
            }}
          >
            B
          </div>
          <div>
            <div
              style={{
                fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.25rem' : '1.5rem',
                fontWeight: 700,
                color: 'var(--color-brand-primary, #281a3c)',
                lineHeight: 1.1,
              }}
            >
              BrainMint
            </div>
            {showSubtitle && (
              <div
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--color-text-secondary, #6f5d6b)',
                  fontWeight: 500,
                }}
              >
                CyberProduct Security
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
