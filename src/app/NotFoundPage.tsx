/**
 * BrainMint NotFoundPage Component (404 Fallback)
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Implements the 404 fallback page faithfully preserving the BrainMint visual system:
 * - Fluid organic canvas with top-right and bottom-right ambient curves
 * - Official BrainMint brand logo header
 * - Rounded card container with soft mauve border and shadow
 * - Clear guidance and React Router navigation back to safety
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrandLogo } from '../components/shared/BrandLogo';
import { Card, Button, Icon } from '../components/ui';

export interface NotFoundPageProps {
  className?: string;
  style?: React.CSSProperties;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ className = '', style }) => {
  const navigate = useNavigate();

  return (
    <main
      className={`brainmint-not-found-page ${className}`}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        backgroundColor: 'var(--color-bg-page, #f6ebf1)',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
    >
      {/* ── Ambient Background Waves matching Figma visual references ───── */}
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
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '480px',
          height: '400px',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.85,
        }}
      >
        <svg
          viewBox="0 0 480 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <path
            d="M480 400V160C410 180 340 260 280 290C200 330 120 320 0 400H480Z"
            fill="var(--color-brand-wave-dark, #2b193d)"
          />
          <path
            d="M480 400V240C430 260 370 300 330 330C280 370 200 380 110 400H480Z"
            fill="var(--color-brand-wave-mid, #4a235c)"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* ── Centered Card Content ────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeIn 250ms ease-out',
        }}
      >
        <div style={{ marginBottom: '1.75rem' }}>
          <BrandLogo size="lg" />
        </div>

        <Card
          variant="subtle"
          padding="none"
          style={{
            width: '100%',
            backgroundColor: '#fff5f5',
            border: '1px solid rgba(196, 154, 185, 0.45)',
            borderRadius: '22px',
            boxShadow:
              '0 18px 45px -10px rgba(40, 26, 60, 0.12), 0 6px 16px -4px rgba(40, 26, 60, 0.05)',
            padding: '40px 36px 36px 36px',
            boxSizing: 'border-box',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Status badge pill */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'var(--color-accent-pink, #f4dee5)',
              color: 'var(--color-brand-primary, #281a3c)',
              fontSize: 'var(--font-size-xs, 0.75rem)',
              fontWeight: 'var(--font-weight-bold, 700)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <Icon name="alert-triangle" size={14} color="var(--color-brand-primary, #281a3c)" />
            404 Error
          </span>

          <h1
            style={{
              fontSize: 'var(--font-size-2xl, 1.5rem)',
              fontWeight: 'var(--font-weight-bold, 700)',
              color: 'var(--color-brand-primary, #281a3c)',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}
          >
            Page Not Found
          </h1>

          <p
            style={{
              fontSize: 'var(--font-size-sm, 0.8125rem)',
              color: 'var(--color-text-secondary, #6f5d6b)',
              lineHeight: 1.6,
              maxWidth: '380px',
              margin: '0 auto 2rem auto',
            }}
          >
            The page you requested doesn't exist, is under active module development by the engineering team, or has been relocated.
          </p>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: '0.75rem',
            }}
          >
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/dashboard')}
              leftIcon={<Icon name="home" size={18} color="#ffffff" />}
              style={{
                height: '46px',
                backgroundColor: 'var(--color-brand-primary, #281a3c)',
                borderRadius: '10px',
                fontSize: 'var(--font-size-base, 0.875rem)',
                fontWeight: 600,
              }}
            >
              Go to Dashboard
            </Button>

            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => navigate('/login')}
              leftIcon={<Icon name="lock" size={16} />}
              style={{
                height: '46px',
                borderRadius: '10px',
                fontSize: 'var(--font-size-sm, 0.8125rem)',
                fontWeight: 600,
              }}
            >
              Back to Sign In
            </Button>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
              style={{
                fontSize: 'var(--font-size-xs, 0.75rem)',
                color: 'var(--color-text-secondary, #6f5d6b)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              ← Return to previous page
            </Link>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
};

export default NotFoundPage;
