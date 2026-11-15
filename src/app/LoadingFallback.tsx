/**
 * BrainMint LoadingFallback Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Full-page loading state preserved with the BrainMint design system.
 */

import React from 'react';
import { BrandLogo } from '../components/shared/BrandLogo';
import { LoadingSpinner } from '../components/ui/Loading';

export interface LoadingFallbackProps {
  message?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading CyberProduct...',
  className = '',
  style,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`brainmint-loading-fallback ${className}`}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-page, #f6ebf1)',
        fontFamily: 'var(--font-sans)',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Decorative ambient background curves matching Figma visual references */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '520px',
          height: '420px',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.85,
        }}
      >
        <svg
          viewBox="0 0 520 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <path
            d="M520 0H220C280 90 380 120 420 220C460 320 380 390 520 420V0Z"
            fill="var(--color-brand-wave-dark, #2b193d)"
          />
          <path
            d="M520 0H310C360 80 430 110 470 190C500 250 490 320 520 360V0Z"
            fill="var(--color-brand-wave-mid, #4a235c)"
            opacity="0.6"
          />
        </svg>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          textAlign: 'center',
        }}
      >
        <BrandLogo size="lg" />

        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <LoadingSpinner size="lg" color="var(--color-brand-primary, #281a3c)" />
          <p
            style={{
              fontSize: 'var(--font-size-base, 0.875rem)',
              color: 'var(--color-text-secondary, #6f5d6b)',
              fontWeight: 'var(--font-weight-medium, 500)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
